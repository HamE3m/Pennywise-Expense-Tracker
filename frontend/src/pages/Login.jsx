import {Box, Button, Container, FormControl, FormLabel, Input, Stack, Text, useToast} from '@chakra-ui/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '', password: '',
  })
  const { login } = useAuth()
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
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      
      if (data.success) {
        login(data.user)
        toast({title: 'Login successful', status: 'success', duration: 3000})
        navigate('/home')
      } else {
        toast({title: 'Error', description: data.message, status: 'error',duration: 3000})
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
      >PennyWise: Expense Tracker</Text>

      <Box borderWidth="1px" borderRadius="lg" p={8}>
        <Stack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">Login</Text>
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
            Login
          </Button>
          <Text>
            Don't have an account? <Link to="/signup" style={{color: 'blue'}}>Sign up</Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  )
}

export default Login