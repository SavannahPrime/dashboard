
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { serviceOptions } from '@/lib/services-data';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header/Nav */}
      <header className="border-b py-4 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">Savannah Prime</div>
          <div className="flex items-center space-x-4">
            <Link to={isAuthenticated ? '/dashboard' : '/login'}>
              <Button variant="ghost">
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Savannah Prime Agency
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-muted-foreground max-w-2xl mx-auto">
            Your partner for professional website development, CMS solutions, AI automation, digital marketing, and branding services.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="h-12 px-6">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="h-12 px-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 px-6 bg-accent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of professional services tailored for your business needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceOptions.map(service => (
              <Card key={service.id} className="premium-card">
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-2xl font-bold">${service.price}</span>
                    <span className="text-muted-foreground">/{service.priceUnit}</span>
                  </div>
                  <ul className="space-y-2">
                    {service.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create an account today and take your business to the next level
          </p>
          <Link to="/register">
            <Button size="lg" className="h-12 px-6">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-xl font-bold mb-4">Savannah Prime Agency</div>
          <div className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Savannah Prime Agency. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
