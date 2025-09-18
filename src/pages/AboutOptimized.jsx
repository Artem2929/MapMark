import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hero, Container, Grid, Card, Button } from '../components/ui';
import Footer from '../components/layout/Footer';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '🗺️',
      title: 'Interactive Maps',
      description: 'Explore places with our advanced mapping technology'
    },
    {
      icon: '📸',
      title: 'Photo Sharing',
      description: 'Share your travel moments with the community'
    },
    {
      icon: '⭐',
      title: 'Reviews & Ratings',
      description: 'Get honest reviews from fellow travelers'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Places' },
    { number: '50K+', label: 'Users' },
    { number: '100K+', label: 'Reviews' },
    { number: '25+', label: 'Countries' }
  ];

  return (
    <div className="about-page">
      <Hero
        icon="🌍"
        title="About MapMark"
        subtitle="Discover amazing places around the world with our community-driven platform"
      />

      <Container>
        {/* Features Section */}
        <section style={{ margin: '80px 0' }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-3xl)', 
            fontWeight: 'var(--font-weight-bold)',
            textAlign: 'center',
            marginBottom: 'var(--space-12)',
            color: 'var(--color-text-primary)'
          }}>
            Why Choose MapMark?
          </h2>
          
          <Grid columns="auto" gap="large">
            {features.map((feature, index) => (
              <Card key={index} variant="glass" hover padding="large">
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-5)' }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: 'var(--space-3)',
                  color: 'var(--color-text-primary)'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </Card>
            ))}
          </Grid>
        </section>

        {/* Stats Section */}
        <Card variant="glass" padding="large" style={{ margin: '80px 0' }}>
          <Grid columns="4" gap="large">
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 'var(--font-size-4xl)',
                  fontWeight: 'var(--font-weight-extrabold)',
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  {stat.number}
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 'var(--font-weight-semibold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </Grid>
        </Card>

        {/* CTA Section */}
        <Card 
          variant="glass" 
          padding="large" 
          style={{ 
            textAlign: 'center',
            margin: '80px 0',
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, rgba(0, 86, 204, 0.02) 100%)'
          }}
        >
          <h2 style={{ 
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-extrabold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-primary)'
          }}>
            Ready to Explore?
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-8)',
            lineHeight: 1.6
          }}>
            Join thousands of travelers discovering amazing places every day
          </p>
          <Button variant="primary" size="large">
            Start Exploring
          </Button>
        </Card>
      </Container>

      <Footer />
    </div>
  );
};

export default About;