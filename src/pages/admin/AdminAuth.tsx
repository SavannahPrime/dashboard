
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdminAuthForm from '@/components/auth/AdminAuthForm';

const AdminAuth: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 px-6 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <Link to="/">
            <h1 className="text-xl font-bold">Savannah Prime</h1>
          </Link>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </header>
      
      <main className="flex-1 container max-w-screen-lg mx-auto p-6 flex flex-col justify-center">
        <div className="pb-12 space-y-6 md:space-y-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Admin Authentication</h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Secure access for Savannah Prime's administration portal
            </p>
          </div>
          
          <div className="mx-auto">
            <AdminAuthForm />
          </div>
        </div>
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Savannah Prime. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminAuth;
