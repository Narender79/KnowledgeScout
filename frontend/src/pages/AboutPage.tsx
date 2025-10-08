import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Lightbulb, 
  Shield, 
  Heart,
  ArrowRight
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former AI researcher at Stanford with 10+ years in machine learning and natural language processing.',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=0ea5e9&color=fff'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Full-stack engineer with expertise in scalable systems and AI integration. Previously at Google.',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=10b981&color=fff'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of AI Research',
      bio: 'PhD in Computer Science, specializing in document understanding and knowledge extraction.',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Watson&background=8b5cf6&color=fff'
    },
    {
      name: 'David Kim',
      role: 'Head of Product',
      bio: 'Product strategist with 8+ years building user-centric AI applications and platforms.',
      avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=f59e0b&color=fff'
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible with AI and document understanding.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe knowledge is best when shared and built together with our community.'
    },
    {
      icon: Shield,
      title: 'Privacy',
      description: 'Your documents and data are protected with enterprise-grade security and privacy controls.'
    },
    {
      icon: Heart,
      title: 'Accessibility',
      description: 'We\'re committed to making knowledge accessible to everyone, regardless of ability or background.'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Knowledge Scout Founded',
      description: 'Started with a vision to democratize document intelligence'
    },
    {
      year: '2024',
      title: 'First AI Model Deployed',
      description: 'Launched our proprietary document understanding system'
    },
    {
      year: '2024',
      title: '10,000+ Documents Processed',
      description: 'Reached our first major milestone in document processing'
    },
    {
      year: '2024',
      title: 'Team Collaboration Features',
      description: 'Added advanced collaboration and sharing capabilities'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              About Knowledge Scout
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              We're on a mission to transform how the world interacts with documents, 
              making every piece of knowledge accessible, searchable, and conversational.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Knowledge Scout was born from a simple yet powerful idea: what if every document 
                could become an intelligent conversation partner? We believe that the future of 
                knowledge work lies not in static documents, but in dynamic, interactive experiences 
                that help people discover insights faster and collaborate more effectively.
              </p>
              <p className="text-lg text-neutral-600">
                Our mission is to democratize access to intelligent document analysis, making 
                advanced AI capabilities available to researchers, students, professionals, and 
                organizations of all sizes.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8"
            >
              <Target className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Our Vision
              </h3>
              <p className="text-neutral-700">
                To create a world where every document becomes a gateway to deeper understanding, 
                where knowledge flows freely between people and ideas, and where the barriers 
                between information and insight are eliminated.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Knowledge Scout
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-neutral-200 p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-neutral-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              The passionate people behind Knowledge Scout
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-neutral-200 p-6 text-center hover:shadow-lg transition-shadow"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-neutral-600 text-sm">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Key milestones in our mission to revolutionize document intelligence
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
                      <div className="text-primary-600 font-bold text-lg mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-neutral-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Knowledge Scout by the Numbers
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              The impact we're making in document intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-primary-100">Documents Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-primary-100">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1.2s</div>
              <div className="text-primary-100">Average Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-primary-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Ready to join our mission?
            </h2>
            <p className="text-xl text-neutral-600 mb-8">
              Start transforming your documents into intelligent conversations today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
