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
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<PropertyROIResult[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        toast({
          title: "File Selected",
          description: `${selectedFile.name} is ready to analyze`
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV, XLSX, or XLS file",
          variant: "destructive"
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        toast({
          title: "File Dropped",
          description: `${droppedFile.name} is ready to analyze`
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV, XLSX, or XLS file",
          variant: "destructive"
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processFile = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setAnalysisComplete(false);
    setResults([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the user ID from the component props
      if (user?.id) {
        formData.append('userId', user.id);
      } else {
        // Fallback to session token if available
        const userToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('session_token='))
          ?.split('=')[1];

        if (userToken) {
          formData.append('userId', userToken);
        }
      }

      const response = await fetch('/api/property-roi-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze file');
      }

      const data = await response.json();
      setResults(data.roiResults);
      setAnalysisComplete(true);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.roiResults.length} properties`
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not process the file. Please try again.",
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
            <p className="text-gray-600">Upload your property data to analyze return on equity and get recommendations</p>
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
              <p className="text-gray-600 dark:text-gray-300">Please sign in to access the Property ROI Calculator</p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => onAuthRequired()}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sign In to Property ROI Calculator
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Upload Section */}
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Property Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <FileSpreadsheet className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Drag & drop your file here</h3>
                    <p className="text-sm text-gray-500">Supports CSV, XLSX, XLS files</p>
                  </div>
                  <div className="relative">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".csv,.xlsx,.xls"
                    />
                    <Button variant="outline" className="border-2 border-dashed">
                      Browse Files
                    </Button>
                  </div>
                  {file && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  onClick={processFile}
                  disabled={!file || isProcessing}
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
      {analysisComplete && results.length > 0 && (
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
                {results.map((result, index) => (
                  <Card key={result.propertyId} className="border border-gray-200 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{result.propertyName}</h3>
                          <p className="text-sm text-gray-600">{result.address}</p>
                          <p className="text-xs text-gray-500">ID: {result.propertyId}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getROIBadgeVariant(result.roeCategory)}>
                            {result.roeCategory.charAt(0).toUpperCase() + result.roeCategory.slice(1)} ROE
                          </Badge>
                          <Badge className={getRecommendationVariant(result.recommendation)}>
                            {result.recommendation.charAt(0).toUpperCase() + result.recommendation.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Purchase Price:</span>
                            <span className="text-sm font-medium">${result.purchasePrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current Value:</span>
                            <span className="text-sm font-medium">${result.currentMarketValue.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Current Loan Balance:</span>
                            <span className="text-sm font-medium">${result.currentLoanBalance?.toLocaleString() || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Annual Debt Service:</span>
                            <span className="text-sm font-medium">${result.annualDebtService?.toLocaleString() || '0'}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ROE:</span>
                            <span className="text-sm font-medium text-blue-600">{result.roePercentage.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Cash Flow:</span>
                            <span className="text-sm font-medium text-green-600">${result.analysis.cashFlow.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Levered ROE:</span>
                            <span className="text-sm font-medium">{result.analysis.leveredROE?.toFixed(2) || 'N/A'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Unlevered ROE:</span>
                            <span className="text-sm font-medium">{result.analysis.unleveredROE?.toFixed(2) || 'N/A'}%</span>
                          </div>
                        </div>
                      </div>

                      {/* ROI Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>ROE Progress</span>
                          <span>{result.roePercentage.toFixed(2)}%</span>
                        </div>
                        <Progress
                          value={Math.min(result.roePercentage * 3, 100)}
                          className="h-2"
                        />
                      </div>

                      {/* Cost Breakdown */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Annual Cost Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-gray-600">Insurance</div>
                            <div className="font-medium">${result.analysis.insuranceCost.toLocaleString()}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-gray-600">Interest Rate</div>
                            <div className="font-medium">{result.analysis.interestRate}%</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-gray-600">Maintenance</div>
                            <div className="font-medium">${result.analysis.maintenance.toLocaleString()}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-gray-600">Taxes</div>
                            <div className="font-medium">${result.analysis.propertyTaxes.toLocaleString()}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-gray-600">Manager Fee</div>
                            <div className="font-medium">${result.analysis.propertyManagerFee.toLocaleString()}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <div className="text-gray-600">Other Costs</div>
                            <div className="font-medium">${result.analysis.otherCosts?.toLocaleString() || '0'}</div>
                          </div>
                        </div>
                      </div>

                      {/* ROE Alerts and Insights */}
                      <div className="mb-4">
                        {result.roePercentage < 3 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">ROE Alert: {result.roePercentage.toFixed(2)}% is below recommended 3% threshold</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">Consider reviewing strategy for this property</p>
                          </div>
                        )}
                        {result.analysis.leveredROE && result.analysis.unleveredROE &&
                         result.analysis.leveredROE < result.analysis.unleveredROE * 0.5 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-800">High Debt Impact: Levered ROE is significantly lower than Unlevered ROE</span>
                            </div>
                            <p className="text-xs text-yellow-600 mt-1">Debt service is heavily impacting your returns</p>
                          </div>
                        )}
                      </div>

                      {/* Concerns and Suggestions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Concerns
                          </h4>
                          <ul className="space-y-1">
                            {result.concerns.map((concern, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{concern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Suggestions
                          </h4>
                          <ul className="space-y-1">
                            {result.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                                <Target className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* ROE Trending Information */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          ROE Trending Insights
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>• ROE typically decreases over time as equity grows and cash flow remains static</p>
                          <p>• Properties with ROE below 3% may be best candidates for selling and reinvestment</p>
                          {result.roePercentage < 3 && (
                            <p className="text-red-600 font-medium">• This property's ROE is below 3%, consider selling and redeploying equity</p>
                          )}
                          {result.roePercentage >= 3 && result.roePercentage < 5 && (
                            <p className="text-yellow-600 font-medium">• This property's ROE is moderate, consider refinancing to improve cash flow</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-800">
                    {results.reduce((sum, r) => sum + r.roePercentage, 0).toFixed(2)}%
                  </div>
                  <div className="text-sm text-blue-600">Average ROE</div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-800">
                    ${results.reduce((sum, r) => sum + r.annualRentalIncome, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Annual Income</div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="text-2xl font-bold text-yellow-800">
                    ${(results.reduce((sum, r) => sum + r.analysis.cashFlow, 0)).toLocaleString()}
                  </div>
                  <div className="text-sm text-yellow-600">Total Cash Flow</div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-2xl font-bold text-purple-800">
                    {results.filter(r => r.recommendation === 'hold').length}
                  </div>
                  <div className="text-sm text-purple-600">Properties to Hold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}