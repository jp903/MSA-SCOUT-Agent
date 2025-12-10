import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Table,
  Calculator,
  DollarSign,
  Building,
  User,
  Calendar,
  BarChart,
  PieChart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PropertyROIResult {
  propertyId: string;
  propertyName: string;
  address: string;
  purchasePrice: number;
  currentMarketValue: number;
  currentLoanBalance?: number;  // Optional for backward compatibility
  annualDebtService?: number;   // Optional for backward compatibility
  annualRentalIncome: number;
  annualExpenses: number;
  roePercentage: number;  // Changed from roiPercentage
  roeCategory: 'excellent' | 'good' | 'moderate' | 'fair' | 'poor';  // Changed from roiCategory
  recommendation: 'sell' | 'hold' | 'improve';
  analysis: {
    unleveredROE?: number;      // New field
    leveredROE?: number;        // New field
    equity?: number;            // New field
    otherCosts: any;
    cashFlow: number;
    capRate: number;
    cashOnCash: number;
    appreciationPotential: number;
    insuranceCost: number;
    interestRate: number;
    maintenance: number;
    propertyTaxes: number;
    propertyManagerFee: number;
  };
  concerns: string[];
  suggestions: string[];
}

interface PropertyROICalculatorProps {
  user: any;
  onAuthRequired: () => void;
}

export default function PropertyROICalculator({ user, onAuthRequired }: PropertyROICalculatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [formData, setFormData] = useState({
    annualRentalIncome: '',
    annualExpenses: '',
    currentMarketValue: '',
    currentLoanBalance: '',
    annualDebtService: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const processForm = async () => {
    setIsProcessing(true);
    setAnalysisComplete(false);
    setResults(null);

    try {
      const response = await fetch('/api/property-roe-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze data');
      }

      const data = await response.json();
      setResults(data);
      setAnalysisComplete(true);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed property`
      });
    } catch (error) {
      console.error("Error processing form:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not process the data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getROIBadgeVariant = (category: string) => {  // Keeping the name for consistency
    switch (category) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fair': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationVariant = (recommendation: string) => {
    switch (recommendation) {
      case 'hold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sell': return 'bg-red-100 text-red-800 border-red-200';
      case 'improve': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property ROE Calculator</h1>
            <p className="text-gray-600">Enter your property data to analyze return on equity and get recommendations</p>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                Sign In Required
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">Please sign in to access the Property ROE Calculator</p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => onAuthRequired()}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In to Property ROE Calculator
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Form Section */}
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Enter Property Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                    <Input
                      id={key}
                      name={key}
                      value={formData[key as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  onClick={processForm}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Data...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Calculate ROE
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Results Section */}
      {analysisComplete && results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">ROE Analysis</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Unlevered ROE:</span>
                          <span className="text-sm font-medium text-blue-600">{results.unleveredRoe?.toFixed(2) || 'N/A'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Levered ROE:</span>
                          <span className="text-sm font-medium text-blue-600">{results.leveredRoe?.toFixed(2) || 'N/A'}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
                      <p className="text-sm text-gray-600">{results.analysisResults}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}