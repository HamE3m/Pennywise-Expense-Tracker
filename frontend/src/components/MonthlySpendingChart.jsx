import {useState, useEffect} from 'react'
import {Box, VStack, HStack, Text, Spinner, Alert, AlertIcon, useColorModeValue, Stat, StatLabel, StatNumber, Grid, GridItem} from '@chakra-ui/react'
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement} from 'chart.js'
import {Line, Doughnut} from 'react-chartjs-2'
import {useAuth} from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement)

const MonthlySpendingChart = ({ month, year, budget }) => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/transactions/${user.id}?month=${month}&year=${year}&limit=1000`)
      const data = await response.json()
      if (data.success) {
        const expenses = data.data.transactions.filter(t => t.type === 'expense')
        setTransactions(expenses)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch transactions')
      }
    } catch (error) {
      setError('Could not load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && month && year) {
      fetchTransactions()
    }
  }, [user, month, year])
  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[monthNum - 1]
  }
  const processChartData = () => {
    const categoryTotals = {}
    const dailyTotals = {}
    let totalSpent = 0
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      dailyTotals[i] = 0
    }
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other'
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount
      totalSpent += transaction.amount
      const transactionDate = new Date(transaction.date)
      const day = transactionDate.getDate()
      if (day >= 1 && day <= daysInMonth) {
        dailyTotals[day] += transaction.amount
      }
    })
    return { categoryTotals, dailyTotals, totalSpent }
  }
  const { categoryTotals, dailyTotals, totalSpent } = processChartData()
  const budgetRemaining = budget ? budget.totalBudget - totalSpent : 0
  const budgetRemainingPositive = Math.max(0, budgetRemaining)
  const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56']
  const lineChartData = {
    labels: Object.keys(dailyTotals).map(day => `Day ${day}`),
    datasets: [
      {label: 'Daily Spending (৳)',
        data: Object.values(dailyTotals),
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#36A2EB',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const doughnutChartData = {
    labels: [...Object.keys(categoryTotals), ...(budgetRemainingPositive > 0 ? ['Remaining Budget'] : [])],
    datasets: [
      {
        data: [...Object.values(categoryTotals), ...(budgetRemainingPositive > 0 ? [budgetRemainingPositive] : [])],
        backgroundColor: [
          ...chartColors.slice(0, Object.keys(categoryTotals).length),
          ...(budgetRemainingPositive > 0 ? ['#E2E8F0'] : [])
        ],
        borderColor: [
          ...chartColors.slice(0, Object.keys(categoryTotals).length).map(color => color + '80'),
          ...(budgetRemainingPositive > 0 ? ['#CBD5E0'] : [])
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {display: false},
      title: {
        display: true,
        text: `Daily Spending - ${getMonthName(month)} ${year}`,
        font: {size: 16,weight: 'bold'}
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ৳${context.parsed.y.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '৳' + value.toFixed(0)
          }
        }
      },
      x: {
        ticks: {maxRotation: 45,minRotation: 0}
      }
    }
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {usePointStyle: true, pointStyle: 'circle', padding: 20}
      },
      title: {
        display: true,
        text: 'Budget Distribution',
        font: {size: 16, weight: 'bold'}
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ৳${context.parsed.toFixed(2)} (${percentage}%)`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Loading spending data...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    )
  }

  if (transactions.length === 0) {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" bg={bgColor} borderColor={borderColor}>
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="bold" color="gray.600">
            Spending Overview
          </Text>
          <Text color="gray.500" textAlign="center">
            No expenses recorded for {getMonthName(month)} {year}
          </Text>
        </VStack>
      </Box>
    )
  }

  const budgetPercentage = budget && budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0
  return (
    <Box p={8} borderWidth="1px" borderRadius="xl" bg={bgColor} borderColor={borderColor} shadow="sm">
      <VStack spacing={8}>
        <Box width="100%" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            {getMonthName(month)} Spending Overview
          </Text>
        </Box>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6} width="100%">
          <GridItem>
            <Stat textAlign="center" p={6} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50">
              <StatLabel color="gray.600" fontSize="sm">Total Spent</StatLabel>
              <StatNumber color="red.500" fontSize="2xl">৳{totalSpent.toFixed(2)}</StatNumber>
            </Stat>
          </GridItem>
          {budget && budget.totalBudget > 0 && (
            <GridItem>
              <Stat textAlign="center" p={6} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50">
                <StatLabel color="gray.600" fontSize="sm">Remaining Budget</StatLabel>
                <StatNumber 
                  color={budgetRemaining < 0 ? 'red.500' : budgetRemaining < budget.totalBudget * 0.3 ? 'orange.500' : 'green.500'} 
                  fontSize="2xl"
                >
                  ৳{budgetRemaining.toFixed(2)}
                </StatNumber>
              </Stat>
            </GridItem>
          )}
          {budget && budget.totalBudget > 0 && (
            <GridItem>
              <Stat textAlign="center" p={6} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50">
                <StatLabel color="gray.600" fontSize="sm">Budget Progress</StatLabel>
                <StatNumber 
                  color={budgetPercentage > 100 ? 'red.500' : budgetPercentage > 70 ? 'orange.500' : 'green.500'} 
                  fontSize="2xl"
                >
                  {budgetPercentage.toFixed(1)}%
                </StatNumber>
              </Stat>
            </GridItem>
          )}
        </Grid>
        <Grid templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }} gap={10} width="100%">
          <GridItem>
            <Box height="350px" p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="white">
              <Line data={lineChartData} options={lineChartOptions} />
            </Box>
          </GridItem>
          <GridItem>
            <Box height="350px" p={4} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="white">
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  )
}
export default MonthlySpendingChart
