import Header from "../components/Header";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-[url("/bg_img.png")] bg-cover bg-center'>
      <Navbar />
      <Header />
    </div>
  );
};

export default Home;
