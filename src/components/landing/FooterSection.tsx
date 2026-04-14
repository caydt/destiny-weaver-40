const FooterSection = () => {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 사주 상담. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
