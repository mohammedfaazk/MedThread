import * as React from 'react';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export function Tabs({ value, onValueChange, children, className = '' }: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return <div>{children}</div>;
}
