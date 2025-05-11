
"use client"; // Required for charts and interactive elements

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // ShadCN calendar
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, Line, LineChart, RadialBar, RadialBarChart } from 'recharts';

import { GraduationCap, Briefcase, Users, BadgeDollarSign, MoreHorizontal, Settings, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";


// Sample data (replace with Firebase data)
const totalEarningsData = [
  { month: "Jan", earnings: 40000, expenses: 24000 },
  { month: "Feb", earnings: 30000, expenses: 13980 },
  { month: "Mar", earnings: 20000, expenses: 9800 },
  { month: "Apr", earnings: 27800, expenses: 39080 },
  { month: "May", earnings: 18900, expenses: 48000 },
  { month: "Jun", earnings: 23900, expenses: 38000 },
  { month: "Jul", earnings: 50000, expenses: 43000 },
  { month: "Aug", earnings: 45000, expenses: 39000 },
  { month: "Sep", earnings: 32000, expenses: 20000 },
  { month: "Oct", earnings: 25000, expenses: 28000 },
  { month: "Nov", earnings: 15000, expenses: 10000 },
  { month: "Dec", earnings: 38000, expenses: 32000 },
];

const chartConfig = {
  earnings: { label: "Earnings", color: "hsl(var(--accent))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
};

const feeDetailsData = [
  { studId: "8A0168", name: "John Doe", avatar: "https://picsum.photos/32/32?random=10", feeType: "Monthly Fee", feeAmount: 1436, status: "Paid" },
  { studId: "9C0189", name: "Jenny Wilson", avatar: "https://picsum.photos/32/32?random=11", feeType: "Annual Exam Fee", feeAmount: 800, status: "Not paid" },
  { studId: "6D0211", name: "Robert Fox", avatar: "https://picsum.photos/32/32?random=12", feeType: "Class Test", feeAmount: 275, status: "Not paid" },
  { studId: "9B0078", name: "Jacob Jones", avatar: "https://picsum.photos/32/32?random=13", feeType: "Monthly Fee", feeAmount: 1436, status: "Paid" },
  { studId: "7A0022", name: "Wade Warren", avatar: "https://picsum.photos/32/32?random=14", feeType: "Monthly Fee", feeAmount: 1436, status: "Paid" },
];

const topPerformersData = [
  { studId: "8A0168", name: "Ralph Edwards", avatar: "https://picsum.photos/32/32?random=20", classSection: "8.A", percentage: "98.5%", classRank: "1st Rank" },
  { studId: "9C0189", name: "Jane Cooper", avatar: "https://picsum.photos/32/32?random=21", classSection: "9.C", percentage: "97%", classRank: "3rd Rank" },
  { studId: "8D0072", name: "Wade Warren", avatar: "https://picsum.photos/32/32?random=22", classSection: "8.D", percentage: "96.25%", classRank: "1st Rank" },
  { studId: "6B0231", name: "Cody Fisher", avatar: "https://picsum.photos/32/32?random=23", classSection: "6.B", percentage: "97.83%", classRank: "2nd Rank" },
  { studId: "7D0147", name: "Kristin Watson", avatar: "https://picsum.photos/32/32?random=24", classSection: "7.D", percentage: "96.46%", classRank: "1st Rank" },
];

const eventsData = [
    { date: "01 Jan, 2023", title: "New Year Celebration", time: "10:00 AM" },
    { date: "26 Jan, 2023", title: "Republic Day Celebration", time: "09:00 AM" },
    { date: "15 Feb, 2023", title: "Science Fair", time: "Full Day" },
];

const attendanceData = [
  { name: 'Students', value: 84, fill: 'hsl(var(--accent))' }, // Blue
  { name: 'Faculty', value: 91, fill: 'hsl(var(--chart-2))' }, // Yellow/Orange
];

export default function AdminDashboardPage() {
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date(2023,0,1)); // January 2023
  const [currentMonthEvents, setCurrentMonthEvents] = useState(eventsData.slice(0,2));


  // TODO: Fetch data from Firebase here using useEffect and store in state variables.
  // For example:
  // useEffect(() => {
  //   const fetchData = async () => {
  //     // const studentsSnap = await getDocs(collection(db, "students"));
  //     // setStudentsCount(studentsSnap.size);
  //     // ... fetch other data
  //   };
  //   fetchData();
  // }, []);

  const statsCards = [
    { title: "Students", value: "1279", icon: GraduationCap, bgColor: "bg-yellow-100", textColor: "text-yellow-600", iconColor:"text-yellow-500" },
    { title: "Faculty", value: "254", icon: Briefcase, bgColor: "bg-blue-100", textColor: "text-blue-600", iconColor:"text-blue-500" },
    { title: "Parents", value: "872", icon: Users, bgColor: "bg-green-100", textColor: "text-green-600", iconColor: "text-green-500"},
    { title: "Earnings", value: "$42.8k", icon: BadgeDollarSign, bgColor: "bg-red-100", textColor: "text-red-600", iconColor: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Earnings Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Earnings</CardTitle>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs"> <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]"></span> Earnings </div>
                <div className="flex items-center gap-1 text-xs"> <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]"></span> Expenses </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">2022 <ChevronDown className="ml-1 h-3 w-3"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] p-2">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart data={totalEarningsData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `$${value/1000}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="earnings" fill="var(--color-earnings)" radius={[4, 4, 0, 0]} barSize={15}/>
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} barSize={15}/>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Events Calendar */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Events Calendar</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
          </CardHeader>
          <CardContent className="p-2">
            {currentMonthEvents.map(event => (
                <Link href="#" key={event.title} className="mb-2 flex items-center justify-between p-3 bg-secondary/50 rounded-md hover:bg-secondary transition-colors">
                    <div>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                </Link>
            ))}
             <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                className="rounded-md border-none p-0 mt-2 [&_button]:h-7 [&_button]:w-7 [&_caption_label]:text-sm"
                classNames={{
                    caption_label: "text-sm font-medium text-primary",
                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent/20 text-accent-foreground",
                }}
                components={{
                    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
                    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
                }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Details Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Fee Details</CardTitle>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4 text-muted-foreground"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4 text-muted-foreground"/></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead className="pl-6">Stud ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Fee Amount</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeDetailsData.map((fee) => (
                  <TableRow key={fee.studId}>
                    <TableCell className="pl-6 text-muted-foreground">{fee.studId}</TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={fee.avatar} alt={fee.name} data-ai-hint="student avatar"/>
                                <AvatarFallback>{fee.name[0]}</AvatarFallback>
                            </Avatar>
                            {fee.name}
                        </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fee.feeType}</TableCell>
                    <TableCell className="text-muted-foreground">${fee.feeAmount}</TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={fee.status === "Paid" ? "default" : "destructive"} 
                             className={fee.status === "Paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        {fee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             <div className="p-4 text-right">
                <Button variant="link" size="sm" className="text-primary hover:underline">See All <ArrowRight className="ml-1 h-3 w-3"/></Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Chart */}
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Attendance</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[250px] pt-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                        innerRadius="60%" 
                        outerRadius="85%" 
                        barSize={15} 
                        data={attendanceData} 
                        startAngle={90} 
                        endAngle={-270}
                    >
                        <RadialBar
                            background
                            dataKey="value"
                            cornerRadius={10}
                        />
                         <RechartsTooltip contentStyle={{fontSize: '12px', padding: '5px 8px', borderRadius: '4px'}} />
                        <Legend 
                            iconSize={10} 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            formatter={(value, entry) => <span className="text-xs text-muted-foreground">{value} {entry.payload?.value}%</span>}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Top Performers</CardTitle>
           <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4 text-muted-foreground"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4 text-muted-foreground"/></Button>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="pl-6">Stud ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class.Section</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead className="pr-6">Class Rank</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformersData.map((perf) => (
                <TableRow key={perf.studId}>
                  <TableCell className="pl-6 text-muted-foreground">{perf.studId}</TableCell>
                  <TableCell className="font-medium">
                     <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={perf.avatar} alt={perf.name} data-ai-hint="student avatar"/>
                            <AvatarFallback>{perf.name[0]}</AvatarFallback>
                        </Avatar>
                        {perf.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{perf.classSection}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 font-medium">{perf.percentage}</Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-muted-foreground">{perf.classRank}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 text-right">
                <Button variant="link" size="sm" className="text-primary hover:underline">See All <ArrowRight className="ml-1 h-3 w-3"/></Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

