import SectionWrapper from '@/components/SectionWrapper';
const Section1 = () => (
  <SectionWrapper animation="fade">
    <div className="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-black">
      <h1 className="text-5xl font-heading mb-4">Section 1</h1>
      <p className="text-lg">Welcome to Section 1</p>
    </div>
  </SectionWrapper>
);
export default Section1;
