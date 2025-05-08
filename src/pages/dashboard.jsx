import { useState, useRef, useEffect, Component } from "react";
import {
  DollarSign,
  Menu,
  X,
  Download,
  Copy,
  Check,
  User,
  Loader,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import profileImg from "../assets/profile.jpg";

// Error Boundary Component
class ChartErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 text-center">
          Unable to render chart. Please try again later.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [btcPriceData, setBtcPriceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7"); // Default 7 days
  const [currentPrice, setCurrentPrice] = useState(null);

  const userName = "Aliyah Eastham";
  const btcWalletAddress = "bc1qr0j4swu6n56jakfawe09rjumt0t4wzhgzul3ep";
  const walletRef = useRef(null);
  const balance = 42000;
  const userEmail = "aliyaheastham223@gmail.com";
  const profileImageUrl = profileImg;
  const MINIMUM_WITHDRAWAL = 43900;

  // Fetch BTC OHLC data from CoinGecko API
  useEffect(() => {
    const fetchBtcData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${timeRange}`
        );
        const data = await response.json();

        // Validate and format the OHLC data
        const formattedData = data
          .filter(
            (item) =>
              Array.isArray(item) &&
              item.length === 5 &&
              item.every((val) => typeof val === "number" && !isNaN(val))
          )
          .map((item) => ({
            date: new Date(item[0]).toLocaleDateString(),
            open: item[1],
            high: item[2],
            low: item[3],
            close: item[4],
            isBullish: item[4] >= item[1], // Close >= Open
            bodyHigh: Math.max(item[1], item[4]),
            bodyLow: Math.min(item[1], item[4]),
          }));

        console.log("Formatted API Data:", formattedData); // Debug log

        // Set data and current price if valid, otherwise use sample data
        if (formattedData.length > 0) {
          setBtcPriceData(formattedData);
          setCurrentPrice(formattedData[formattedData.length - 1].close);
        } else {
          console.warn("No valid API data, using sample data");
          const sampleData = generateSampleData(timeRange);
          setBtcPriceData(sampleData);
          setCurrentPrice(sampleData[sampleData.length - 1].close);
        }
      } catch (error) {
        console.error("Error fetching BTC OHLC data:", error);
        // Use sample data if API fails
        const sampleData = generateSampleData(timeRange);
        setBtcPriceData(sampleData);
        setCurrentPrice(sampleData[sampleData.length - 1].close);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBtcData();
  }, [timeRange]);

  // Generate sample OHLC data as fallback
  const generateSampleData = (days) => {
    const sampleData = [];
    const basePrice = 62500;
    const now = new Date();

    for (let i = parseInt(days); i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Simulate OHLC data
      const randomFactor = 0.98 + Math.random() * 0.04; // +/- 2%
      const open = basePrice * randomFactor + i * 50;
      const close = open * (0.99 + Math.random() * 0.02); // Slight variation
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (0.99 - Math.random() * 0.01);

      sampleData.push({
        date: date.toLocaleDateString(),
        open: open,
        high: high,
        low: low,
        close: close,
        isBullish: close >= open,
        bodyHigh: Math.max(open, close),
        bodyLow: Math.min(open, close),
      });
    }

    console.log("Sample Data Generated:", sampleData); // Debug log
    return sampleData;
  };

  const openModal = (type) => {
    setTransactionType(type);
    setShowModal(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (walletRef.current) {
      navigator.clipboard.writeText(btcWalletAddress).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const renderContent = () => {
    if (activeTab === "dashboard") {
      return (
        <div className="py-4">
          {/* Balance Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Balance
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Available funds
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="text-4xl font-bold text-gray-900">
                ${balance.toLocaleString()}
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6 flex space-x-4">
              <button
                onClick={() => openModal("deposit")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Deposit
              </button>
              <button
                onClick={() => openModal("withdraw")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Download className="mr-2 h-4 w-4" />
                Withdraw
              </button>
            </div>
          </div>

          {/* Bitcoin Candlestick Chart */}
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Bitcoin Chart
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {currentPrice
                    ? `Current price: $${currentPrice.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 2,
                        }
                      )}`
                    : "Loading price data..."}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeRange("1")}
                  className={`px-2 py-1 text-xs rounded-md ${
                    timeRange === "1"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeRange("7")}
                  className={`px-2 py-1 text-xs rounded-md ${
                    timeRange === "7"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeRange("30")}
                  className={`px-2 py-1 text-xs rounded-md ${
                    timeRange === "30"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  30d
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6 h-64">
              {isLoading || btcPriceData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="animate-spin h-8 w-8 text-blue-600" />
                </div>
              ) : (
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={btcPriceData}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(tick) => {
                          if (timeRange === "1") {
                            return new Date(tick).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          }
                          return tick;
                        }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          `$${Math.round(value).toLocaleString()}`
                        }
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (
                            name === "open" ||
                            name === "high" ||
                            name === "low" ||
                            name === "close"
                          ) {
                            return [
                              `$${value.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}`,
                              name.charAt(0).toUpperCase() + name.slice(1),
                            ];
                          }
                          return value;
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border rounded shadow">
                                <p>Date: {data.date}</p>
                                <p>
                                  Open: $
                                  {data.open.toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p>
                                  High: $
                                  {data.high.toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p>
                                  Low: $
                                  {data.low.toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                                <p>
                                  Close: $
                                  {data.close.toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      {/* Candlestick body */}
                      <Bar
                        dataKey="bodyHigh"
                        fill="#00FF00"
                        shape={(props) => {
                          const { x, width, payload, yAxis } = props;
                          // Debug log to inspect props
                          console.log("Shape Props:", { yAxis, payload });
                          // Safeguard against undefined or invalid props
                          if (
                            !payload ||
                            !yAxis ||
                            !yAxis.scale ||
                            isNaN(payload.bodyHigh) ||
                            isNaN(payload.bodyLow)
                          ) {
                            console.warn(
                              "Invalid shape props, skipping render"
                            );
                            return null;
                          }
                          // Calculate pixel positions using yAxis scale
                          const bodyHighY = yAxis.scale(payload.bodyHigh);
                          const bodyLowY = yAxis.scale(payload.bodyLow);
                          const height = Math.abs(bodyHighY - bodyLowY);
                          const adjustedY = payload.isBullish
                            ? bodyLowY
                            : bodyHighY;
                          // Ensure valid numbers
                          if (
                            isNaN(height) ||
                            isNaN(adjustedY) ||
                            height <= 0
                          ) {
                            console.warn(
                              "Invalid height or Y position, skipping render"
                            );
                            return null;
                          }
                          return (
                            <rect
                              x={x}
                              y={adjustedY}
                              width={width / 2}
                              height={height || 1} // Ensure minimum height
                              fill={payload.isBullish ? "#00FF00" : "#FF0000"}
                            />
                          );
                        }}
                        name="Candlestick"
                      />
                      {/* High-Low wicks */}
                      <Line
                        type="linear"
                        dataKey="high"
                        stroke="#000000"
                        dot={false}
                        connectNulls
                        name="High"
                        strokeWidth={1}
                        activeDot={false}
                      />
                      <Line
                        type="linear"
                        dataKey="low"
                        stroke="#000000"
                        dot={false}
                        connectNulls
                        name="Low"
                        strokeWidth={1}
                        activeDot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              )}
            </div>
          </div>
        </div>
      );
    } else if (activeTab === "profile") {
      return (
        <div className="py-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 mb-4 sm:mb-0">
                    <div className="relative">
                      {profileImageUrl ? (
                        <img
                          className="h-32 w-32 rounded-full object-cover border-4 border-white shadow"
                          src={profileImageUrl}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold border-4 border-white shadow">
                          {userName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:ml-6 flex-1">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Full name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {userName}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {userEmail}
                        </dd>
                      </div>

                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Account status
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          Wallet address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          <span className="font-mono text-xs truncate flex-1">
                            {btcWalletAddress}
                          </span>
                          <button
                            onClick={copyToClipboard}
                            className="ml-2 text-xs text-blue-600 flex items-center"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar - desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-blue-600">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-white">My Portfolio</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <a
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group cursor-pointer ${
                  activeTab === "dashboard"
                    ? "text-white bg-blue-700"
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <DollarSign className="mr-3 h-6 w-6" />
                Dashboard
              </a>

              <a
                onClick={() => setActiveTab("profile")}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group cursor-pointer ${
                  activeTab === "profile"
                    ? "text-white bg-blue-700"
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <User className="mr-3 h-6 w-6" />
                Profile
              </a>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {profileImageUrl ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={profileImageUrl}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-medium">
                    {userName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{userName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-blue-600 p-4">
        <h1 className="text-xl font-bold text-white">My Portfolio</h1>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="text-white focus:outline-none"
        >
          {showMobileMenu ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-blue-600">
          <nav className="px-2 pt-2 pb-3 space-y-1">
            <a
              onClick={() => {
                setActiveTab("dashboard");
                setShowMobileMenu(false);
              }}
              className={`flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer ${
                activeTab === "dashboard"
                  ? "text-white bg-blue-700"
                  : "text-blue-100 hover:bg-blue-700"
              }`}
            >
              <DollarSign className="mr-3 h-6 w-6" />
              Dashboard
            </a>
            <a
              onClick={() => {
                setActiveTab("profile");
                setShowMobileMenu(false);
              }}
              className={`flex items-center px-2 py-2 text-base font-medium rounded-md cursor-pointer ${
                activeTab === "profile"
                  ? "text-white bg-blue-700"
                  : "text-blue-100 hover:bg-blue-700"
              }`}
            >
              <User className="mr-3 h-6 w-6" />
              Profile
            </a>
          </nav>
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {profileImageUrl ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={profileImageUrl}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-medium">
                    {userName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">
                  {userName}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === "dashboard"
                  ? `Welcome back, ${userName}`
                  : "Your Profile"}
              </h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full z-20">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    {transactionType === "deposit" ? (
                      <Upload className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Download className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium text-gray-900">
                      {transactionType === "deposit"
                        ? "Deposit Funds"
                        : "Withdraw Funds"}
                    </h3>
                    <div className="mt-4">
                      {transactionType === "deposit" ? (
                        <p className="text-sm text-gray-500 mb-2">
                          Any amount deposited will be automatically credited to
                          your balance
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 mb-2">
                          {balance >= MINIMUM_WITHDRAWAL
                            ? "Your balance meets the minimum withdrawal requirement. Please contact your portfolio manager for final processing"
                            : `Minimum withdrawal is $${MINIMUM_WITHDRAWAL.toLocaleString()}. Please deposit $1,900 to meet the withdrawal limit.`}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">
                        Wallet Address:
                      </p>
                      <div className="flex items-center bg-gray-100 p-2 rounded">
                        <div
                          ref={walletRef}
                          className="flex-1 text-xs font-mono truncate"
                        >
                          {btcWalletAddress}
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className="ml-2 text-xs text-blue-600 flex items-center"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
