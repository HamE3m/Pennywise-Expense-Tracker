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
    <Container maxW="container.sm" py={8}>
      <Text
        fontSize={{ base: "22", sm: "28" }}
        fontWeight={"bold"}
        textAlign={"center"}
        bgGradient={"linear(to-r, cyan.400, blue.500)"}
        bgClip={"text"}
        mb={8}
      >
        PennyWise: Expense Tracker
      </Text>
      <Box borderWidth="1px" borderRadius="lg" p={8}>
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">Sign Up</Text>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Sign Up
          </Button>
          <Text>
            Already have an account? <Link to="/login" style={{color: 'blue'}}>Login</Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default Signup