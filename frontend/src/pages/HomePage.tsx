import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  MessageSquare, 
  Users, 
  BarChart3, 
  ArrowRight, 
  Play,
  Star,
  Zap
} from 'lucide-react';

interface HomePageProps {
  onOpenDemo: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onOpenDemo }) => {
  const features = [
    {
      icon: Upload,
      title: "Smart Document Upload",
      description: "Drag and drop any document format. Our AI instantly extracts and analyzes content with precision."
    },
    {
      icon: MessageSquare,
      title: "Intelligent Q&A",
      description: "Ask natural language questions and get contextual answers with source citations and references."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share documents, collaborate on analysis, and build knowledge together with your team."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track your learning progress, document insights, and discover patterns in your knowledge base."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Research Student",
      content: "Knowledge Scout transformed how I analyze research papers. I can ask specific questions and get instant, accurate answers.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Business Analyst",
      content: "The team collaboration features are incredible. We can share insights and build on each other's analysis seamlessly.",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "University Professor",
      content: "This platform has revolutionized our research workflow. The AI understanding of complex academic content is remarkable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Document Intelligence</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
                Transform Documents into
                <span className="text-primary-600 block">Intelligent Conversations</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
                Upload any document, ask questions, get instant insights. Knowledge Scout makes every document 
                an interactive learning experience powered by advanced AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link 
                to="/upload" 
                className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Your First Document</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                onClick={onOpenDemo}
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-neutral-600">Documents Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
                <div className="text-neutral-600">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">2s</div>
                <div className="text-neutral-600">Average Response</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Everything you need for intelligent document analysis
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed to transform how you interact with documents and extract insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Loved by researchers, students, and professionals
            </h2>
            <p className="text-xl text-neutral-600">
              See what our users are saying about Knowledge Scout
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                  <div className="text-neutral-600 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your documents?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of users who are already discovering insights with Knowledge Scout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-white text-primary-600 hover:bg-neutral-100 font-medium px-8 py-4 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/demo" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium px-8 py-4 rounded-lg transition-colors duration-200"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
