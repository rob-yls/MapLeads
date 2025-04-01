// This is a mock file to simulate recharts components since we can't add npm packages directly
// In a real project, you would install recharts via npm

export const BarChart = ({ children, data }) => <div className="recharts-bar-chart">{children}</div>

export const Bar = ({ dataKey, fill }) => <div className="recharts-bar" style={{ backgroundColor: fill }}></div>

export const XAxis = ({ dataKey }) => <div className="recharts-x-axis"></div>

export const YAxis = () => <div className="recharts-y-axis"></div>

export const CartesianGrid = ({ strokeDasharray }) => <div className="recharts-cartesian-grid"></div>

export const Tooltip = () => <div className="recharts-tooltip"></div>

export const ResponsiveContainer = ({ width, height, children }) => (
  <div className="recharts-responsive-container" style={{ width, height }}>
    {children}
  </div>
)

export const PieChart = ({ children }) => <div className="recharts-pie-chart">{children}</div>

export const Pie = ({ data, cx, cy, labelLine, outerRadius, fill, dataKey, label, children }) => (
  <div className="recharts-pie">{children}</div>
)

// Changed 'key' to 'cellKey' to avoid React's special prop name
export const Cell = ({ cellKey, fill }) => <div className="recharts-cell" style={{ backgroundColor: fill }}></div>

export const Legend = () => <div className="recharts-legend"></div>

