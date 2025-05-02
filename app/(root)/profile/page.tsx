"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { HustleTip } from "@/components/hustle-tip"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
  })

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.fullName || user.username || "",
        bio: user.publicMetadata.bio as string || "",
        location: user.publicMetadata.location as string || "",
        website: user.publicMetadata.website as string || "",
      })
    }
  }, [user])

  if (!user) {
    return (
      <div className="container py-10">
        <Card className="card-sharp border-white">
          <CardHeader>
            <CardTitle className="gangster-font text-white">LOADING PROFILE</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading your profile data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/sign-in")
  }

  const handleSaveProfile = async () => {
    // In a real implementation, this would save to Clerk metadata
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="text-center mb-4">
        <div className="gangster-gradient text-white py-6 px-4 mb-4 border-white border-2">
          <h1 className="text-4xl font-bold text-white graffiti-font text-shadow">HUSTLER PROFILE</h1>
          <p className="text-white/80 mt-1">YOUR STATS. YOUR REPUTATION. YOUR GAME.</p>
        </div>

        <HustleTip title="KEEP YOUR PROFILE TIGHT">
          <p>
            A strong profile shows you mean business. Keep your info current and professional. Your reputation is everything in this game.
          </p>
        </HustleTip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="card-sharp border-white h-full">
            <CardHeader>
              <CardTitle className="gangster-font text-white">HUSTLER ID</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-2 border-white">
                <AvatarImage src={user.imageUrl} alt={user.fullName || user.username || "User"} />
                <AvatarFallback className="bg-smoke text-white text-xl">
                  {getInitials(user.fullName || user.username || "User")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-white">{user.fullName || user.username}</h2>
              <p className="text-white/70 text-sm mt-1">{user.emailAddresses[0]?.emailAddress}</p>
              <p className="text-white/70 text-sm">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
              
              <Button 
                variant="destructive" 
                className="mt-6 w-full bg-red-600 hover:bg-red-700" 
                onClick={handleLogout}
              >
                SIGN OUT
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="profile" 
                className={`gangster-font border-white border ${activeTab === "profile" ? 'bg-white text-black' : ''}`}
              >
                PROFILE
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={`gangster-font border-white border ${activeTab === "settings" ? 'bg-white text-black' : ''}`}
              >
                SETTINGS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card className="card-sharp border-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="gangster-font text-white">PROFILE INFO</CardTitle>
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "CANCEL" : "EDIT"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="displayName" className="text-white">Display Name</Label>
                        <Input 
                          id="displayName"
                          value={profile.displayName}
                          onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                          className="bg-smoke border-white text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio" className="text-white">Bio</Label>
                        <Input 
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({...profile, bio: e.target.value})}
                          className="bg-smoke border-white text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-white">Location</Label>
                        <Input 
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                          className="bg-smoke border-white text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-white">Website</Label>
                        <Input 
                          id="website"
                          value={profile.website}
                          onChange={(e) => setProfile({...profile, website: e.target.value})}
                          className="bg-smoke border-white text-white"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveProfile}
                        className="w-full bg-smoke border-white text-white hover:bg-white hover:text-black"
                      >
                        SAVE CHANGES
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-white font-bold">Display Name</h3>
                        <p>{profile.displayName || "Not set"}</p>
                      </div>
                      <Separator className="bg-white/20" />
                      <div>
                        <h3 className="text-white font-bold">Bio</h3>
                        <p>{profile.bio || "Tell people about your hustle"}</p>
                      </div>
                      <Separator className="bg-white/20" />
                      <div>
                        <h3 className="text-white font-bold">Location</h3>
                        <p>{profile.location || "Not specified"}</p>
                      </div>
                      <Separator className="bg-white/20" />
                      <div>
                        <h3 className="text-white font-bold">Website</h3>
                        <p>{profile.website || "Not specified"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-sharp border-white mt-6">
                <CardHeader>
                  <CardTitle className="gangster-font text-white">HUSTLE STATS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-smoke p-4 rounded-lg">
                      <p className="text-sm text-white/70">Total Sales</p>
                      <p className="text-2xl font-bold text-white">$0</p>
                    </div>
                    <div className="bg-smoke p-4 rounded-lg">
                      <p className="text-sm text-white/70">Active Customers</p>
                      <p className="text-2xl font-bold text-white">0</p>
                    </div>
                    <div className="bg-smoke p-4 rounded-lg">
                      <p className="text-sm text-white/70">Products</p>
                      <p className="text-2xl font-bold text-white">0</p>
                    </div>
                    <div className="bg-smoke p-4 rounded-lg">
                      <p className="text-sm text-white/70">Profit</p>
                      <p className="text-2xl font-bold text-white">$0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="card-sharp border-white">
                <CardHeader>
                  <CardTitle className="gangster-font text-white">ACCOUNT SETTINGS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-bold">Email Notifications</h3>
                        <p className="text-sm text-white/70">Get notified about important updates</p>
                      </div>
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                        MANAGE
                      </Button>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-bold">Change Password</h3>
                        <p className="text-sm text-white/70">Update your password regularly</p>
                      </div>
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                        UPDATE
                      </Button>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-bold">Two-Factor Authentication</h3>
                        <p className="text-sm text-white/70">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                        SETUP
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <h3 className="text-white font-bold mb-2">Danger Zone</h3>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                    DELETE ACCOUNT
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}