export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        max-w-7xl mx-auto 
        px-4 sm:px-6 lg:px-8 
        py-4 sm:py-6 lg:py-8 
        text-center
      "
    >
      {children}
      <footer className="mt-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} SkyLimTech Inc™ All rights reserved.
      </footer>
    </div>
  );
}