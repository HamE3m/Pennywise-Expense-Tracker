import {Container, Box, Text, VStack, HStack, Divider, Button, useToast, Input, FormControl, FormLabel} from '@chakra-ui/react'
import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'

const Profile = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: ''
  })
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }


  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      newPassword: ''
    })
  }


  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${user.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        login(data.user)
        setIsEditing(false)
        toast({title: 'Profile updated successfully', status: 'success', duration: 3000})
      } else {
        toast({title: 'Error', description: data.message, status: 'error', duration: 3000})
      }
    } catch (error) {
      toast({title: 'Error', description: 'Could not update profile', status: 'error', duration: 3000})
    }
  }


  const handleLogout = () => {
    logout()
    toast({title: 'Logged out successfully', status: 'success', duration: 3000})
    navigate('/login')
  }
return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-t, #1C495E, #17694D)"
      fontFamily="'Roboto', sans-serif"
    >
      <Container maxW="container.md" py={8}>
        <Text
          fontSize="4xl"
          fontWeight={"bold"}
          textAlign={"center"}
          color={"white"}
          mb={8}
          fontFamily="'Roboto', sans-serif"
        >Profile Information</Text>
      <Box 
        borderWidth="1px" 
        borderRadius="xl" 
        p={8}
        bg="white"
        borderColor="gray.200"
        shadow="sm"
      >
        {user ? (
          <VStack spacing={4} align="stretch">
            {isEditing ? (
              <>
                <FormControl>
                  <FormLabel fontFamily="'Roboto', sans-serif">Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontFamily="'Roboto', sans-serif">Email</FormLabel>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontFamily="'Roboto', sans-serif">Current Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontFamily="'Roboto', sans-serif">New Password (Optional)</FormLabel>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </FormControl>
                <HStack spacing={4}>
                  <Button colorScheme="green" onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </HStack>
              </>
            ) : (
              <>
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontFamily="'Roboto', sans-serif">User ID:</Text>
                  <Text fontFamily="'Roboto', sans-serif">{user.id}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontFamily="'Roboto', sans-serif">Name:</Text>
                  <Text fontFamily="'Roboto', sans-serif">{user.name}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontFamily="'Roboto', sans-serif">Email:</Text>
                  <Text fontFamily="'Roboto', sans-serif">{user.email}</Text>
                </HStack>
                <Button 
                  bg="#17694D" 
                  color="white" 
                  _hover={{ bg: "#1C495E" }}
                  _active={{ bg: "#145A3F" }}
                  onClick={handleEdit} 
                  mt={4}
                >
                  Edit Profile
                </Button>
                <Button colorScheme="red" onClick={handleLogout} mt={4}>
                  Logout
                </Button>
              </>
            )}
          </VStack>
        ) : (
          <Text textAlign="center" fontFamily="'Roboto', sans-serif">Please log in to view profile</Text>
        )}
      </Box>
      </Container>
    </Box>
  )
}

export default Profile