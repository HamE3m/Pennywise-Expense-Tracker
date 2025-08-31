import {useState, useEffect} from 'react'
import {Container, Box, Text, VStack, Grid, GridItem, Stat, StatLabel, StatNumber, Spinner, Alert, AlertIcon, useColorModeValue, Progress, SimpleGrid, Tooltip} from '@chakra-ui/react'
import {Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip as ChartTooltip, Legend} from 'chart.js'
import {Line} from 'react-chartjs-2'
import {useAuth} from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, ChartTooltip, Legend)

const HomePage = () => {
  const { user } = useAuth()
  const [monthlyData, setMonthlyData] = useState([])
  const [currentBudget, setCurrentBudget] = useState(null)
  const [dailySpending, setDailySpending] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' })


  const fetchDashboardData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const monthsData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const response = await fetch(`http://localhost:5000/api/transactions/${user.id}?month=${month}&year=${year}&limit=1000`)
        const data = await response.json()
        if (data.success) {
          const expenses = data.data.transactions.filter(t => t.type === 'expense')
          const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0)          
          monthsData.push({
            month: date.toLocaleString('default', { month: 'short' }),
            year: year,
            totalSpent: totalSpent,
            transactionCount: expenses.length
          })
        }
      }
      setMonthlyData(monthsData)
      const budgetResponse = await fetch(`http://localhost:5000/api/budget/${user.id}`)
      const budgetData = await budgetResponse.json()
      if (budgetData.success) {
        setCurrentBudget(budgetData.data)
      }
      const currentMonthResponse = await fetch(`http://localhost:5000/api/transactions/${user.id}?month=${currentMonth}&year=${currentYear}&limit=1000`)
      const currentMonthData = await currentMonthResponse.json()
      if (currentMonthData.success) {
        const expenses = currentMonthData.data.transactions.filter(t => t.type === 'expense')
        const dailyTotals = {}
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
        for (let i = 1; i <= daysInMonth; i++) {
          dailyTotals[i] = 0
        }
        expenses.forEach(transaction => {
          const transactionDate = new Date(transaction.date)
          const day = transactionDate.getDate()
          if (day >= 1 && day <= daysInMonth) {
            dailyTotals[day] += transaction.amount
          }
        })
        setDailySpending(dailyTotals)
      }
    } catch (error) {
      setError('Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }


  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate()
  }


  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay()
  }


  const getDayColor = (day) => {
    if (!currentBudget || currentBudget.totalBudget === 0) return 'gray.100'
    const dailyBudget = 500
    const daySpending = dailySpending[day] || 0
    if (daySpending === 0) return 'gray.100'
    const percentage = (daySpending / dailyBudget) * 100
    if (percentage <= 80) return 'green.200'
    if (percentage <= 120) return 'yellow.200'
    return 'red.200'
  }


  const getDayTextColor = (day) => {
    if (!currentBudget || currentBudget.totalBudget === 0) return 'gray.600'
    const dailyBudget = 500
    const daySpending = dailySpending[day] || 0
    if (daySpending === 0) return 'gray.600'
    const percentage = (daySpending / dailyBudget) * 100
    if (percentage <= 80) return 'green.800'
    if (percentage <= 120) return 'yellow.800'
    return 'red.800'
  }


  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const today = new Date().getDate()
    const isCurrentMonth = new Date().getMonth() + 1 === currentMonth && new Date().getFullYear() === currentYear
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    dayNames.forEach(dayName => {
      days.push(
        <Box key={dayName} textAlign="center" py={1} fontWeight="bold" fontSize="sm" color="gray.600" minWidth="100px">
          {dayName}
        </Box>
      )
    })
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const daySpending = dailySpending[day] || 0
      const dailyBudget = 500
      days.push(
        <Tooltip
          key={day}
          label={
            <Box textAlign="center">
              <Text fontWeight="bold" fontFamily="'Roboto', sans-serif">{currentMonthName} {day}</Text>
              <Text fontFamily="'Roboto', sans-serif">Spent: ৳{daySpending.toFixed(2)}</Text>
              <Text fontFamily="'Roboto', sans-serif">Daily Budget: ৳{dailyBudget.toFixed(2)}</Text>
            </Box>
          }
          hasArrow
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="38px"
            width="100%"
            minWidth="100px"
            borderRadius="lg"
            bg={getDayColor(day)}
            color={getDayTextColor(day)}
            fontWeight={isCurrentMonth && day === today ? 'bold' : 'medium'}
            border={isCurrentMonth && day === today ? '2px solid' : 'none'}
            borderColor={isCurrentMonth && day === today ? 'blue.500' : 'transparent'}
            cursor="pointer"
            _hover={{ transform: 'scale(1.02)' }}
            transition="all 0.2s"
            fontSize="lg"
          >
            {day}
          </Box>
        </Tooltip>
      )
    }
    return (
      <SimpleGrid columns={7} spacing={2}>
        {days}
      </SimpleGrid>
    )
  }
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])


  const monthlySpendingChart = {
    labels: monthlyData.map(d => `${d.month} ${d.year}`),
    datasets: [
      {
        label: 'Monthly Spending (৳)',
        data: monthlyData.map(d => d.totalSpent),
        borderColor: '#3182CE',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3182CE',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  }


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Monthly Spending Trend (Last 6 Months)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Spending: ৳${context.parsed.y.toFixed(2)}`
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
      }
    }
  }
  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6}>
          <Spinner size="xl" />
          <Text fontSize="lg" fontFamily="'Roboto', sans-serif">Loading dashboard...</Text>
        </VStack>
      </Container>
    )
  }
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }


  const budgetPercentage = currentBudget && currentBudget.totalBudget > 0 
    ? (currentBudget.spentAmount / currentBudget.totalBudget) * 100 
    : 0


  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'red'
    if (percentage >= 70) return 'orange'
    return 'green'
  }
  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-t, #1C495E, #17694D)"
      fontFamily="'Roboto', sans-serif"
    >
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" color="white" mb={2} fontFamily="'Roboto', sans-serif">
              Dashboard
            </Text>
            <Text fontSize="lg" color="gray.100" fontFamily="'Roboto', sans-serif">
              Welcome back, {user?.name || 'User'}!
            </Text>
          </Box>
        <Grid templateColumns="1fr 2fr" gap={6} width="100%">
          <GridItem>
            <Box 
              p={5} 
              borderWidth="1px" 
              borderRadius="xl" 
              bg={bgColor} 
              borderColor={borderColor}
              shadow="sm"
              height="100%"
            >
              <VStack spacing={3} height="100%" justify="space-between">
                <Text fontSize="lg" fontWeight="bold" color="gray.800" textAlign="center" fontFamily="'Roboto', sans-serif">
                  {currentMonthName} Budget
                </Text>
                <VStack spacing={3} width="100%" flex="1">
                  <Stat textAlign="center" p={3} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50" width="100%">
                    <StatLabel color="gray.600" fontSize="xs" fontFamily="'Roboto', sans-serif">Total Budget</StatLabel>
                    <StatNumber color="blue.500" fontSize="lg" fontFamily="'Roboto', sans-serif">
                      ৳{currentBudget?.totalBudget?.toFixed(2) || '0.00'}
                    </StatNumber>
                  </Stat>                  
                  <Stat textAlign="center" p={3} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50" width="100%">
                    <StatLabel color="gray.600" fontSize="xs" fontFamily="'Roboto', sans-serif">Spent</StatLabel>
                    <StatNumber color="red.500" fontSize="lg" fontFamily="'Roboto', sans-serif">
                      ৳{currentBudget?.spentAmount?.toFixed(2) || '0.00'}
                    </StatNumber>
                  </Stat>
                  <Stat textAlign="center" p={3} borderWidth="1px" borderRadius="lg" borderColor="gray.100" bg="gray.50" width="100%">
                    <StatLabel color="gray.600" fontSize="xs" fontFamily="'Roboto', sans-serif">Remaining</StatLabel>
                    <StatNumber color="green.500" fontSize="lg" fontFamily="'Roboto', sans-serif">
                      ৳{((currentBudget?.totalBudget || 0) - (currentBudget?.spentAmount || 0)).toFixed(2)}
                    </StatNumber>
                  </Stat>
                </VStack>
                {currentBudget && currentBudget.totalBudget > 0 && (
                  <Box width="100%">
                    <Text fontSize="sm" color="gray.600" mb={2} textAlign="center" fontFamily="'Roboto', sans-serif">
                      {budgetPercentage.toFixed(1)}% used
                    </Text>
                    <Progress 
                      value={budgetPercentage} 
                      colorScheme={getProgressColor(budgetPercentage)}
                      size="md"
                      borderRadius="md"
                    />
                  </Box>
                )}
              </VStack>
            </Box>
          </GridItem>
          <GridItem>
            <Box 
              p={5} 
              borderWidth="1px" 
              borderRadius="xl" 
              bg={bgColor} 
              borderColor={borderColor}
              shadow="sm"
            >
              <VStack spacing={2}>
                <Text fontSize="lg" fontWeight="bold" color="gray.800" textAlign="center" fontFamily="'Roboto', sans-serif">
                  {currentMonthName} {currentYear} Calendar
                </Text>
                {renderCalendar()}
              </VStack>
            </Box>
          </GridItem>
        </Grid>
        <Box 
          p={6} 
          borderWidth="1px" 
          borderRadius="xl" 
          bg={bgColor} 
          borderColor={borderColor} 
          shadow="sm"
          width="100%"
        >
          <VStack spacing={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800" textAlign="center" fontFamily="'Roboto', sans-serif">
              Monthly Spending Trend
            </Text>
            <Box height="280px" width="100%">
              <Line data={monthlySpendingChart} options={chartOptions} />
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
    </Box>
  )
}

export default HomePage