
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-3xl w-full mx-auto text-center space-y-8 animate-fade-up">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to Our Platform</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our community and experience a beautifully designed platform with premium features.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" className="h-12">
            <Link to="/register">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12">
            <a href="#">Learn More</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
