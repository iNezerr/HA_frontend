import React, { useState } from 'react';
import FAQItem from '../components/FAQItem';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqItems = [
    {
      question: "How do I get started with Hues Apply?",
      answer: "Getting started is easy. Sign up for free, complete your profile, and upload your key documents. Hues Apply will use this information to match you with scholarships, jobs, internships, and other opportunities tailored to your goals."
    },
    {
      question: "Who is Hues Apply for?",
      answer: "Hues Apply is built for students, recent graduates, early-career professionals, and underrepresented individuals who are looking for scholarships, grants, fellowships, and career development opportunities."
    },
    {
      question: "What makes Hues Apply different from job boards or scholarship websites?",
      answer: "Hues Apply focuses on more than just jobs. We prioritise scholarships and grants and use AI to personalise recommendations. Our platform also offers guided support to help users complete strong applications and improve their chances of success."
    },
    {
      question: "How does the AI matching system work?",
      answer: "After you complete your profile, our AI reviews your information including your academic background, interests, and goals. It then recommends the most relevant opportunities, helping you save time and find the right fit."
    },
    {
      question: "What types of opportunities are listed on Hues Apply?",
      answer: "You will find a wide range of opportunities including scholarships, fellowships, internships, jobs, academic programmes, exchange opportunities, and grants. All are personalised to match your profile and goals."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="faq-title">
      <div className="max-w-3xl mx-auto">
        <h2 id="faq-title" className="text-3xl font-semibold text-center text-green-500 mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="divide-y divide-gray-200" role="region" aria-label="FAQ accordion">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              id={`faq-${index}`}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
