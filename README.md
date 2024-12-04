# Patent Search UI Component

A React-based patent search interface with real-time results, advanced filtering, and data visualization capabilities.


## 🚀 Features

- 🔍 Real-time patent search with keyword input
- ⚖️ Adjustable precision-recall balance
- 📊 Multiple view layouts (List/Grid)
- 📈 Result relevance visualization
- 📱 Responsive design
- 📋 Copy and share functionality
- 📥 CSV export capabilities
- 📜 Search history management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 16 or higher)
- npm or yarn
- A modern web browser

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install required UI components:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card input button slider dropdown-menu sheet badge tabs alert scroll-area
```

## 💻 Usage

1. Import the component:
```tsx
import SearchResults from './components/SearchResults';
```

2. Use it in your React application:
```tsx
function App() {
  return (
    <div>
      <SearchResults />
    </div>
  );
}
```

3. Configure the API endpoint:
   - Set up your API endpoint in your environment configuration
   - Default endpoint is `/api/search`

## ⚙️ Configuration

Create a `.env` file in your project root:

```env
NEXT_PUBLIC_API_URL=your_api_endpoint
```

## 🔧 API Integration

The component expects the following API response structure:

```typescript
interface APIResponse {
  results: {
    abstract: string[];
    relevance_score: number[];
    degree_between: number[];
  }
}
```

Example API request:
```typescript
{
  keywords: ["your search terms"],
  precision_recall_balance: 0.5
}
```

## 🎨 Customization

### Styling

The component uses Tailwind CSS. You can customize the appearance by:

1. Modifying the Tailwind configuration:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // Your custom styles
    }
  }
}
```

2. Overriding component classes:
```tsx
<SearchResults className="custom-class" />
```

### Component Modifications

Key areas for customization:

- `getRelevanceColor`: Modify the color scheme for relevance scores
- `LoadingSkeleton`: Customize the loading state appearance
- View layouts: Adjust the grid/list view layouts

## 📚 Component Structure

```
SearchResults/
├── SearchResults.tsx      # Main component
├── types.ts              # TypeScript interfaces
└── utils/
```

## 🔍 Props Reference

The component is currently self-contained but can be modified to accept props such as:

```typescript
interface SearchResultsProps {
  apiEndpoint?: string;
  maxHistoryItems?: number;
  defaultPrecisionRecall?: number;
  onSearchComplete?: (results: SearchResults) => void;
}
```

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

