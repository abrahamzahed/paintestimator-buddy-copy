
import { FreeEstimator } from "@/modules/public-estimator";

const NewEstimatePage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Estimate</h1>
      <FreeEstimator isAuthenticated={true} />
    </div>
  );
};

export default NewEstimatePage;
