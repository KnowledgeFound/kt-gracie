import MainLayout from "../../components/layout/MainLayout";
import GreetingPixiPage from "../../components/pixi/greeting/page";
import GreetingForm from "../../features/greeting/components/GreetingForm";

export default function HomePage() {
  return (
    <div className="homePageLayer">
      <div className="homePagePixiLayer">
        <GreetingPixiPage />
      </div>
      <div className="homePageContentLayer">
        <MainLayout>
          <GreetingForm />
        </MainLayout>
      </div>
    </div>
  );
}
