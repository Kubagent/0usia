import SectionWrapper from '@/components/SectionWrapper';
const Section2 = () => (
  <SectionWrapper animation="fade-up">
    <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-900">
      <h1 className="text-5xl font-heading mb-4">Section 2</h1>
      <p className="text-lg">Welcome to Section 2</p>
    </div>
  </SectionWrapper>
);
export default Section2;
