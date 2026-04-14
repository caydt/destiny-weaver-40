import { Clock, Shield, Star } from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: '빠른 상담',
    description: '신청 후 24시간 내 상세한 사주 분석 결과를 받아보실 수 있습니다.',
  },
  {
    icon: Shield,
    title: '비밀 보장',
    description: '모든 상담 내용은 철저히 비밀이 보장되며 안전하게 관리됩니다.',
  },
  {
    icon: Star,
    title: '전문 역학사',
    description: '20년 이상 경력의 전문 역학사가 정성껏 상담해 드립니다.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          왜 저희를 선택하시나요?
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          정확한 분석과 따뜻한 조언으로 많은 분들이 신뢰하고 있습니다.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-300"
              style={{ boxShadow: 'var(--shadow-glow)' }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
