import { useState, useRef, Key } from 'react';
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
  PieChart,
  Printer
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import recharts components
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  LineChart,
  PieChart as RechartsPieChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Sector
} from 'recharts';

interface PropertyROIResult {
  id: string;
  userId: string;
  purchasePrice: number;
  debt: number;
  downPayment: number;
  outOfPocketReno: number;
  totalInitialInvestment: number;
  currentFmv: number;
  currentDebt: number;
  potentialEquity: number;
  loanTerms: number;
  amortization: number;
  interestRate: number;
  acquisitionDate: string | null;
  yearsHeld: number;
  currentPayment: number;
  currentMarketValue: number;
  currentLoanBalance?: number;
  annualDebtService: number;
  noi: number;
  equity: number;
  unleveredRoe: number;
  leveredRoe: number;
  analysisResults: string;
  calculatedMetrics: {
    unleveredROE: number;
    leveredROE: number;
    netOperatingIncome: number;
    equityValue: number;
    debtService: number;
    annualIncome: number;
    annualExpenses: number;
  };
  roeCategory: 'excellent' | 'good' | 'moderate' | 'fair' | 'poor';
  recommendation: 'sell' | 'hold' | 'evaluate';
  analysisSummary: {
    category: string;
    recommendation: string;
    performance: string;
    cashFlow: string;
    capRate: string;
    cashOnCash: string;
  };
  graphData: {
    roeComparison: {
      unlevered: number;
      levered: number;
    };
    incomeExpenses: {
      income: number;
      expenses: number;
      debtService: number;
    };
    equityGrowth: {
      initial: number;
      current: number;
    };
  };
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
    purchasePrice: '',
    debt: '',
    downPayment: '',
    outOfPocketReno: '',
    totalInitialInvestment: '',
    currentFmv: '',
    currentDebt: '',
    potentialEquity: '',
    loanTerms: '',
    amortization: '',
    interestRate: '',
    acquisitionDate: '',
    yearsHeld: '',
    currentPayment: '',
    annualRentalIncome: '',
    annualExpenses: '',
    currentMarketValue: '',
    annualDebtService: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Calculate potential equity when currentFmv or currentDebt changes
      if (name === 'currentFmv' || name === 'currentDebt') {
        const fmv = parseFloat(updatedData.currentFmv) || 0;
        const debt = parseFloat(updatedData.currentDebt) || 0;
        updatedData.potentialEquity = (fmv - debt).toString();
      }
      // Also update when currentMarketValue changes (as an alternative to currentFmv)
      else if (name === 'currentMarketValue') {
        const fmv = parseFloat(updatedData.currentMarketValue) || 0;
        const debt = parseFloat(updatedData.currentDebt) || 0;
        updatedData.potentialEquity = (fmv - debt).toString();
      }
      // Calculate total initial investment when downPayment or outOfPocketReno changes
      else if (name === 'downPayment' || name === 'outOfPocketReno') {
        const downPayment = parseFloat(updatedData.downPayment) || 0;
        const renovation = parseFloat(updatedData.outOfPocketReno) || 0;
        updatedData.totalInitialInvestment = (downPayment + renovation).toString();
      }

      return updatedData;
    });
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

  // Note: The old functions can be removed since we're using different styling now

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
              {/* Basic Property Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Property Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      placeholder="Enter purchase price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentMarketValue">Current Market Value</Label>
                    <Input
                      id="currentMarketValue"
                      name="currentMarketValue"
                      value={formData.currentMarketValue}
                      onChange={handleInputChange}
                      placeholder="Enter current market value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualRentalIncome">Annual Rental Income</Label>
                    <Input
                      id="annualRentalIncome"
                      name="annualRentalIncome"
                      value={formData.annualRentalIncome}
                      onChange={handleInputChange}
                      placeholder="Enter annual rental income"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualExpenses">Annual Expenses</Label>
                    <Input
                      id="annualExpenses"
                      name="annualExpenses"
                      value={formData.annualExpenses}
                      onChange={handleInputChange}
                      placeholder="Enter annual expenses"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                    <Input
                      id="acquisitionDate"
                      name="acquisitionDate"
                      type="date"
                      value={formData.acquisitionDate}
                      onChange={handleInputChange}
                      placeholder="Enter acquisition date"
                    />
                  </div>
                </div>
              </div>

              {/* Financing Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debt">Debt</Label>
                    <Input
                      id="debt"
                      name="debt"
                      value={formData.debt}
                      onChange={handleInputChange}
                      placeholder="Enter debt amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="downPayment">Down Payment</Label>
                    <Input
                      id="downPayment"
                      name="downPayment"
                      value={formData.downPayment}
                      onChange={handleInputChange}
                      placeholder="Enter down payment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentDebt">Current Debt</Label>
                    <Input
                      id="currentDebt"
                      name="currentDebt"
                      value={formData.currentDebt}
                      onChange={handleInputChange}
                      placeholder="Enter current debt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualDebtService">Annual Debt Service</Label>
                    <Input
                      id="annualDebtService"
                      name="annualDebtService"
                      value={formData.annualDebtService}
                      onChange={handleInputChange}
                      placeholder="Enter annual debt service"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      placeholder="Enter interest rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentPayment">Current Payment</Label>
                    <Input
                      id="currentPayment"
                      name="currentPayment"
                      value={formData.currentPayment}
                      onChange={handleInputChange}
                      placeholder="Enter current payment"
                    />
                  </div>
                </div>
              </div>

              {/* Investment Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outOfPocketReno">Out of Pocket Renovation</Label>
                    <Input
                      id="outOfPocketReno"
                      name="outOfPocketReno"
                      value={formData.outOfPocketReno}
                      onChange={handleInputChange}
                      placeholder="Enter renovation costs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalInitialInvestment">Total Initial Investment</Label>
                    <Input
                      id="totalInitialInvestment"
                      name="totalInitialInvestment"
                      value={formData.totalInitialInvestment}
                      onChange={handleInputChange}
                      placeholder="Enter total initial investment"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentFmv">Current FMV</Label>
                    <Input
                      id="currentFmv"
                      name="currentFmv"
                      value={formData.currentFmv}
                      onChange={handleInputChange}
                      placeholder="Enter current fair market value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="potentialEquity">Potential Equity</Label>
                    <Input
                      id="potentialEquity"
                      name="potentialEquity"
                      value={formData.potentialEquity}
                      onChange={handleInputChange}
                      placeholder="Enter potential equity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsHeld">Number of Years Held</Label>
                    <Input
                      id="yearsHeld"
                      name="yearsHeld"
                      value={formData.yearsHeld}
                      onChange={handleInputChange}
                      placeholder="Enter years held"
                    />
                  </div>
                </div>
              </div>

              {/* Loan Terms */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Loan Terms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loanTerms">Loan Terms (months)</Label>
                    <Input
                      id="loanTerms"
                      name="loanTerms"
                      value={formData.loanTerms}
                      onChange={handleInputChange}
                      placeholder="Enter loan terms in months"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amortization">Amortization (months)</Label>
                    <Input
                      id="amortization"
                      name="amortization"
                      value={formData.amortization}
                      onChange={handleInputChange}
                      placeholder="Enter amortization in months"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
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
        <div className="space-y-6 print:space-y-4">
          <Card className="print:shadow-none print:border print:rounded-lg">
            <CardHeader className="print:py-3 print:px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl print:text-lg">
                  <BarChart className="h-5 w-5" />
                  <span className="print:text-base">Property ROE Analysis Results</span>
                </CardTitle>
                {/* Print button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="print:hidden flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="print:p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-4">
                {/* Summary Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                  <Card className="bg-blue-50 border-blue-200 print:p-2">
                    <CardContent className="p-4 print:p-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700 print:text-lg">{results.calculatedMetrics?.unleveredROE?.toFixed(2) || 'N/A'}%</div>
                        <div className="text-sm text-blue-600 print:text-xs">Unlevered ROE</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200 print:p-2">
                    <CardContent className="p-4 print:p-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700 print:text-lg">{results.calculatedMetrics?.leveredROE?.toFixed(2) || 'N/A'}%</div>
                        <div className="text-sm text-green-600 print:text-xs">Levered ROE</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200 print:p-2">
                    <CardContent className="p-4 print:p-2">
                      <div className="text-center">
                        <div className="text-xl font-bold print:text-lg">
                          {results.roeCategory?.charAt(0).toUpperCase() + results.roeCategory?.slice(1)}
                        </div>
                        <div className="text-sm text-purple-600 print:text-xs">ROE Category</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={`print:p-2 ${
                    results.recommendation === 'sell' ? 'bg-red-50 border-red-200' :
                    results.recommendation === 'hold' ? 'bg-blue-50 border-blue-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <CardContent className="p-4 print:p-2">
                      <div className="text-center">
                        <div className="text-xl font-bold print:text-lg">
                          {results.recommendation?.toUpperCase()}
                        </div>
                        <div className="text-sm print:text-xs">Recommendation</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphs Section */}
                <div className="lg:col-span-3 print:hidden">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Financial Performance Charts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ROE Comparison Chart */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 text-center">ROE Comparison</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartsBarChart data={[{
                            name: 'ROE',
                            'Unlevered': results.calculatedMetrics?.unleveredROE,
                            'Levered': results.calculatedMetrics?.leveredROE
                          }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" />
                            <Tooltip formatter={(value) => [`${value}%`, 'Value']} />
                            <Legend />
                            <Bar dataKey="Unlevered" name="Unlevered ROE" fill="#3b82f6" />
                            <Bar dataKey="Levered" name="Levered ROE" fill="#10b981" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Income vs Expenses Chart */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2 text-center">Income vs Expenses</h4>
                        <ResponsiveContainer width="100%" height={250}>
                          <RechartsBarChart data={[{
                            name: 'Finances',
                            Income: results.calculatedMetrics?.annualIncome,
                            Expenses: results.calculatedMetrics?.annualExpenses,
                            'Debt Service': results.annualDebtService
                          }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']} />
                            <Legend />
                            <Bar dataKey="Income" name="Annual Income" fill="#10b981" />
                            <Bar dataKey="Expenses" name="Annual Expenses" fill="#f59e0b" />
                            <Bar dataKey="Debt Service" name="Annual Debt Service" fill="#ef4444" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Detailed Analysis and Key Metrics */}
                <div className="lg:col-span-2 print:w-full print:overflow-auto">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full print:p-1">
                          <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>Detailed Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-700 max-h-96 overflow-y-auto print:overflow-visible print:max-h-none space-y-4">
                        {results.analysisResults
                          .split('## ')
                          .filter((section: string) => section.trim() !== '')
                          .map((section: string, index: number) => {
                            const lines = section.split('\n');
                            const title = lines[0]?.trim() || '';
                            const content = lines.slice(1).join('\n').trim();

                            return (
                              <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                                {title && (
                                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    {title}
                                  </h3>
                                )}
                                {content && (
                                  <div className="text-gray-700 whitespace-pre-line ml-2">
                                    {content}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Metrics */}
                <div className="print:w-full">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-full print:p-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <span>Key Metrics</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Net Operating Income (NOI):</span>
                          <span className="font-medium">${Number(results.calculatedMetrics?.netOperatingIncome).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Equity Value:</span>
                          <span className="font-medium">${Number(results.calculatedMetrics?.equityValue).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Cash Flow:</span>
                          <span className="font-medium">${Number(results.analysisSummary?.cashFlow).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Cap Rate:</span>
                          <span className="font-medium">{results.analysisSummary?.capRate}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Cash-on-Cash:</span>
                          <span className="font-medium">{results.analysisSummary?.cashOnCash}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Debt Service:</span>
                          <span className="font-medium">${Number(results.calculatedMetrics?.debtService).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-gray-50">
                        <h4 className="font-semibold mb-2">Investment Recommendation:</h4>
                        <p className="text-sm">
                          <span className={`font-medium ${
                            results.recommendation === 'sell' ? 'text-red-600' :
                            results.recommendation === 'hold' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {results.recommendation?.toUpperCase()}:
                          </span> {results.roeCategory ?
                            results.roeCategory === 'excellent' ? 'This property shows excellent returns and is a strong hold.' :
                            results.roeCategory === 'good' ? 'This property shows good returns and is worth holding.' :
                            results.roeCategory === 'moderate' ? 'This property shows moderate returns; consider your investment goals.' :
                            results.roeCategory === 'fair' ? 'This property shows fair returns; evaluate for potential improvements.' :
                            'This property shows poor returns; consider selling.' :
                          'Recommendation unavailable.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}