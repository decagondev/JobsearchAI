import { Users, Target, Lightbulb, Heart } from "lucide-react"

export function About() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            About <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">BotAI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building the future of intelligent automation, one bot at a time.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-6">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Empowering Innovation Through AI
              </h2>
              <p className="text-muted-foreground text-lg mb-4">
                At BotAI, we believe that artificial intelligence should be accessible, 
                powerful, and easy to use. Our mission is to democratize AI-powered 
                automation, making it possible for anyone to build intelligent bots that 
                solve real-world problems.
              </p>
              <p className="text-muted-foreground text-lg">
                We're committed to providing cutting-edge technology that learns, adapts, 
                and evolves with your needs, ensuring your bots stay ahead of the curve.
              </p>
            </div>
            <div className="p-8 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Innovation First</h3>
                    <p className="text-muted-foreground">
                      We continuously push the boundaries of what's possible with AI and automation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">User-Centric</h3>
                    <p className="text-muted-foreground">
                      Every feature we build is designed with our users' needs and feedback in mind.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Passion-Driven</h3>
                    <p className="text-muted-foreground">
                      We love what we do, and that passion drives us to deliver exceptional experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground text-lg">
              How we started and where we're going
            </p>
          </div>
          
          <div className="space-y-8 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              BotAI was born from a simple observation: building intelligent bots shouldn't 
              require a PhD in machine learning or months of development time. We set out to 
              create a platform that makes AI-powered automation accessible to everyone, from 
              startups to enterprises.
            </p>
            <p className="text-lg leading-relaxed">
              Today, thousands of developers and businesses trust BotAI to power their 
              automation needs. We've helped companies streamline operations, enhance customer 
              experiences, and unlock new possibilities through intelligent automation.
            </p>
            <p className="text-lg leading-relaxed">
              As we look to the future, we're excited to continue innovating and expanding 
              what's possible with AI. Our commitment remains the same: to provide the best 
              tools and platform for building intelligent bots that make a real difference.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Whether you're building your first bot or scaling your automation infrastructure, 
            we're here to help you succeed.
          </p>
        </div>
      </section>
    </div>
  )
}

