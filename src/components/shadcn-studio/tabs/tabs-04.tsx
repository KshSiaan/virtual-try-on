import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabsWithBadge = ({
  tabs,
}: {
  tabs: {
    name: string;
    value: string;
    count: number;
    content: React.ReactNode;
  }[];
}) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="explore" className="gap-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1 px-2.5 sm:px-3"
            >
              {tab.name}
              {tab.count > 0 && (
                <Badge className="h-5 min-w-5 px-1 tabular-nums">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div>{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TabsWithBadge;
