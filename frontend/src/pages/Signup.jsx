import {Box, Button, Container, FormControl, FormLabel, Input, Stack, Text, useToast} from '@chakra-ui/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const toast = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }


  const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const response = await fetch('http://localhost:5000/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    const data = await response.json()
    if (data.success) {
      toast({title: 'Account created successfully', status: 'success', duration: 3000})
      navigate('/login')
    } else {
      toast({title: 'Error', description: data.message, status: 'error', duration: 3000})
    }
  } catch (error) {
    toast({title: 'Error', description: 'Could not connect to server', status: 'error', duration: 3000})
  }
}
  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-t, #1C495E, #17694D)"
      fontFamily="'Roboto', sans-serif"
    >
      <Container maxW="container.sm" py={8}>
        <Box textAlign="center" mb={8}>
          <Text
            fontSize="6xl"
            fontWeight="bold"
            color="white"
            fontFamily="'Limelight', cursive"
            mb={0}
          >
            PennyWise
          </Text>
          <Text
            fontSize="lg"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            A Budget Planner and Expense Tracker
          </Text>
        </Box>

        <Box 
          borderWidth="1px" 
          borderRadius="xl" 
          p={8}
          bg="white"
          borderColor="gray.200"
          shadow="sm"
        >
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" fontFamily="'Roboto', sans-serif">Sign Up</Text>
          <FormControl>
            <FormLabel fontFamily="'Roboto', sans-serif">Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontFamily="'Roboto', sans-serif">Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontFamily="'Roboto', sans-serif">Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>
          <Button 
            bg="#17694D" 
            color="white" 
            _hover={{ bg: "#1C495E" }}
            _active={{ bg: "#145A3F" }}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Text fontFamily="'Roboto', sans-serif">
            Already have an account? <Link to="/login" style={{color: '#17694D'}}>Login</Link>
          </Text>
        </Stack>
      </Box>
      </Container>
    </Box>
  )
}

export default Signup