const FormSection = () => {
  return (
    <section id="form-section" className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          상담 신청
        </h2>
        <p className="text-muted-foreground text-center mb-12">
          아래 양식을 작성해 주시면 빠르게 상담을 진행해 드리겠습니다.
        </p>

        <div className="p-8 rounded-lg bg-card border border-border text-center">
          <p className="text-muted-foreground">상담 신청 폼은 다음 단계에서 구현됩니다.</p>
        </div>
      </div>
    </section>
  );
};

export default FormSection;
