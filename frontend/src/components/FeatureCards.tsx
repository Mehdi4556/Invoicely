export default function FeatureCards() {
  const features = [
    {
      title: "Beautiful",
      description: "Professionally designed and visually appealing invoices can increase the chances of clients paying promptly.",
      icon: "🎨"
    },
    {
      title: "Free & Unlimited",
      description: "Create and send as many invoices as you need — no limits, no hidden costs, just seamless billing freedom.",
      icon: "♾️"
    },
    {
      title: "Safe & Secure",
      description: "Your data stays yours — we never track, sell, or share it. Store everything locally or securely on our server — the choice is yours.",
      icon: "🔒"
    }
  ];

  return (
    <section className="pt-8 pb-20 px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card border border-border rounded-lg p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground font-dm-sans mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-dm-sans leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
