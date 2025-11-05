use actix_web::{App, HttpRequest, HttpResponse, HttpServer, Responder, get, middleware, web};
use lazy_static::lazy_static;
use reqwest::Client;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Params {
    name: Option<String>,
    limit: Option<i32>,
}

#[derive(Debug, Deserialize)]
struct RedditResponse {
    data: RedditData,
}

#[derive(Debug, Deserialize)]
struct RedditData {
    children: Vec<RedditChild>,
}

#[derive(Debug, Deserialize)]
struct RedditChild {
    data: Post,
}
#[derive(Debug, Deserialize, serde::Serialize)]
struct Post {
    title: String,
    url: String,
    ups: i32,
    over_18: bool,
    author: String,
    downs: i32,
    num_comments: i32,
    is_video: bool,
    secure_media: Option<Media>,
    thumbnail: String,
    created_utc: f64,
    #[serde(skip_deserializing)]
    snippets: Vec<String>,
    preview: Option<Preview>,
    selftext: String,
}
#[derive(Debug, Deserialize, serde::Serialize, Clone)]
struct Preview {
    images: Vec<PreviewImage>,
}

#[derive(Debug, Deserialize, serde::Serialize, Clone)]
struct PreviewImage {
    source: ImageSource,
}

#[derive(Debug, Deserialize, serde::Serialize, Clone)]
struct ImageSource {
    url: String,
    width: u32,
    height: u32,
}
#[derive(Debug, Deserialize, serde::Serialize, Clone)]
struct Media {
    #[serde(flatten)]
    extra_fields: Option<serde_json::Value>, // Capture any additional fields
}

// ================ NEW: GLOBAL HTTP CLIENT ================
lazy_static! {
    static ref HTTP_CLIENT: Client = Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .user_agent(format!("PetrusBot/1.0 (contact: petrus@example.com)"))
        .build()
        .expect("Failed to build HTTP client");
}
// =========================================================
// ================ NEW: IMAGE EXTRACTION ================
/// Extraímos a melhor imagem do post, considerando o preview e o URL direto.
fn extract_best_image(post: &Post) -> Option<String> {
    // primeiro, tenta extrair do preview
    if let Some(preview) = &post.preview {
        if let Some(first_image) = preview.images.first() {
            let mut image_url = first_image.source.url.replace("&amp;", "&");

            // Corrigir domínio
            if image_url.contains("external-preview.redd.it") {
                image_url =
                    image_url.replacen("https://external-preview.redd.it", "https://i.redd.it", 1);
            } else if image_url.contains("external-i.redd.it") {
                image_url =
                    image_url.replacen("https://external-i.redd.it", "https://i.redd.it", 1);
            } else if image_url.contains("preview.redd.it") {
                image_url = image_url.replacen("https://preview.redd.it", "https://i.redd.it", 1);
            }

            // Se ainda tiver "external-" na URL, ignora
            if image_url.contains("external-") {
                // Ignorar imagem inválida
            } else {
                return Some(image_url);
            }
        }
    }

    // se falhou no preview, tenta no url direto
    if (post.url.ends_with(".jpg")
        || post.url.ends_with(".png")
        || post.url.ends_with(".jpeg")
        || post.url.ends_with(".webp"))
        && !post.url.contains("external-")
    {
        return Some(post.url.clone());
    }

    // por último, tenta a thumbnail, se for válida
    if post.thumbnail.starts_with("http") && !post.thumbnail.contains("external-") {
        return Some(post.thumbnail.clone());
    }

    // se nada servir, retorna None
    None
}

async fn getpostfn(
    name: Option<String>,
    limit: Option<i32>,
) -> Result<Vec<Post>, Box<dyn std::error::Error>> {
    let subreddit = name.unwrap_or_else(|| "MemesBR".to_string());

    // sanitize o nome para evitar SSRF
    if !subreddit
        .chars()
        .all(|c| c.is_ascii_alphanumeric() || c == '_')
    {
        return Err("Nome de subreddit inválido".into());
    }

    let limit_value = limit.unwrap_or(10);
    let url = format!(
        "https://www.reddit.com/r/{}/top.json?limit={}",
        subreddit, limit_value
    );

    let response: reqwest::Response = HTTP_CLIENT.get(url).send().await?;

    if !response.status().is_success() {
        return Err(format!("Erro ao buscar do Reddit: HTTP {}", response.status()).into());
    }

    let text: String = response.text().await?;

    let parsed: RedditResponse = match serde_json::from_str(&text) {
        Ok(data) => data,
        Err(e) => {
            return Err(format!("Falha ao parsear JSON: {}", e).into());
        }
    };

    let posts = parsed
        .data
        .children
        .into_iter()
        .filter_map(|child| {
            let mut post = child.data;

            // IGNORA posts com secure_media (geralmente vídeos)
            if post.secure_media.is_some() {
                return None;
            }
            // IGNORA posts maiores de 18 anos.
            if post.over_18 {
                return None;
            }

            // Extrai imagem principal
            if extract_best_image(&post).is_none() {
                return None; // Ignora posts sem imagem válida
            }
            // Preenche snippets (resumo do selftext)
            post.snippets = if post.selftext.trim().is_empty() {
                vec![]
            } else {
                post.selftext
                    .lines()
                    .filter(|line| !line.trim().is_empty())
                    .take(3)
                    .map(|s| s.trim().to_string())
                    .collect()
            };

            Some(post)
        })
        .collect::<Vec<Post>>();

    Ok(posts)
}

#[get("/meme")]
async fn mandarmemes(req: HttpRequest) -> impl Responder {
    let params = match web::Query::<Params>::from_query(req.query_string()) {
        Ok(query) => query,
        Err(_) => return HttpResponse::BadRequest().body("Parâmetros inválidos."),
    };

    let limit = match params.limit {
        Some(l) if l >= 1 && l <= 50 => l,
        None => 10,
        _ => return HttpResponse::BadRequest().body("O limite deve estar entre 1 e 50."),
    };

    match getpostfn(Some("MemesBR".to_string()), Some(limit)).await {
        Ok(posts) => {
            let posts_json: Vec<_> = posts
                .into_iter()
                .map(|post| {
                    serde_json::json!({
                        "title": post.title,
                        "url": post.url,
                        "author": post.author,
                        "over_18": post.over_18,
                        "thumbnail": post.thumbnail,
                        "image": extract_best_image(&post),
                        "created_utc": post.created_utc,
                        "ups": post.ups,
                        "downs": post.downs,
                        "num_comments": post.num_comments,
                        "snippets": post.snippets,
                        "is_video": post.is_video,
                    })
                })
                .collect();

            HttpResponse::Ok().json(posts_json)
        }
        Err(err) => {
            eprintln!("Erro interno: {:?}", err);
            HttpResponse::InternalServerError()
                .body("Falha ao buscar dados do Reddit. Tente novamente mais tarde.")
        }
    }
}

#[get("/")]
async fn home() -> impl Responder {
    HttpResponse::Ok().body("Petrus API")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default()) // Log requests
            .service(home)
            .service(mandarmemes)
    })
    .bind(("127.0.0.1", 3001))?
    .run()
    .await
}
