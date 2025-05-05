#!/bin/bash

echo "🧹 Limpando completamente o cache do Docker..."

docker container prune -f
docker image prune -a -f
docker network prune -f
docker builder prune --all -f

read -p "💾 Deseja limpar volumes não utilizados? (s/N) " RESP
if [[ "$RESP" =~ ^[sS]$ ]]; then
  docker volume prune -f
fi

echo "✅ Docker totalmente limpo."

echo "🔧 Construindo imagem Docker..."
docker build $BUILD_OPTS --rm -f Dockerfile -t hexgano/petrus .

if [ $? -ne 0 ]; then
  echo "❌ Erro ao construir a imagem. Abortando."
  exit 1
fi

echo "🧹 Removendo contêiner antigo (se existir)..."
docker rm -f petrus 2>/dev/null

echo "🚀 Iniciando novo contêiner..."
docker run -d --name petrus hexgano/petrus

echo "📄 Logs do contêiner:"
docker logs -f petrus