import dynamic from 'next/dynamic';

// Importar o Navbar dinamicamente com SSR desabilitado
const Navbar = dynamic(() => import('./navbar'), { 
  ssr: false 
});

const Header = () => {
  return <Navbar />;
};

export default Header;