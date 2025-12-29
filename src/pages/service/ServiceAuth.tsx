import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Lock, User, Phone, MapPin, CreditCard, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ServiceAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login state
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  // Signup state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleServiceLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if it's the main service account
      if (employeeId === "service@gmail.com" || employeeId.toLowerCase() === "service") {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: "service@gmail.com",
          password: password,
        });

        if (signInError) throw signInError;

        // Verify service role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profile?.role !== "service") {
          await supabase.auth.signOut();
          throw new Error("Access denied. Service credentials required.");
        }

        toast({
          title: "Welcome to Service Panel",
          description: "Successfully logged in",
        });

        navigate("/service");
      } else {
        // Employee login with employee ID
        const { data: employee } = await supabase
          .from("service_employees")
          .select("*, user_id")
          .eq("employee_id", employeeId.toUpperCase())
          .single();

        if (!employee) {
          throw new Error("Invalid employee ID or password");
        }

        // Login with the associated email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", employee.user_id)
          .single();

        if (!profile) {
          throw new Error("Employee account not found");
        }

        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: password,
        });

        if (signInError) throw signInError;

        toast({
          title: "Welcome Back!",
          description: `Logged in as ${employee.full_name}`,
        });

        navigate("/service");
      }
    } catch (error: any) {
      console.error("Service login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function generateEmployeeId(): Promise<string> {
    // Get the count of existing employees
    const { count } = await supabase
      .from("service_employees")
      .select("*", { count: "exact", head: true });

    const empNumber = (count || 0) + 1;
    return `EMP${String(empNumber).padStart(5, "0")}`; // e.g., EMP00001
  }

  async function handleEmployeeSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: newPassword,
        options: {
          data: {
            full_name: fullName,
            role: "service",
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user account");

      // Generate employee ID
      const employeeIdGenerated = await generateEmployeeId();

      // Create employee record
      const { error: employeeError } = await supabase
        .from("service_employees")
        .insert({
          user_id: authData.user.id,
          employee_id: employeeIdGenerated,
          full_name: fullName,
          email: email,
          phone: phone,
          address: address,
          city: city,
          state: state,
          pan_number: panNumber.toUpperCase(),
          aadhar_number: aadharNumber,
          status: "active",
        });

      if (employeeError) throw employeeError;

      // Update profile to service role
      await supabase
        .from("profiles")
        .update({ role: "service", full_name: fullName })
        .eq("id", authData.user.id);

      toast({
        title: "Registration Successful!",
        description: `Your Employee ID is: ${employeeIdGenerated}. Please save it for login.`,
        duration: 10000,
      });

      // Show employee ID in an alert
      alert(`✅ Registration Successful!\n\nYour Employee ID: ${employeeIdGenerated}\n\nPlease save this ID. You'll need it to login.\n\nYou can now login with your Employee ID and password.`);

      // Switch to login tab
      setIsLogin(true);
      
      // Clear form
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCity("");
      setState("");
      setPanNumber("");
      setAadharNumber("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Employee signup error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create employee account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-4">
      <Card className="w-full max-w-2xl border-orange-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Service Panel</CardTitle>
          <CardDescription className="text-slate-400">
            Employee & Service Team Access
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={isLogin ? "login" : "signup"} onValueChange={(v) => setIsLogin(v === "login")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Employee Login</TabsTrigger>
              <TabsTrigger value="signup">New Employee</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleServiceLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-slate-300">
                    <User className="w-4 h-4 inline mr-2" />
                    Employee ID or Email
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="EMP00001 or service@gmail.com"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Enter your Employee ID or service email</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In to Service Panel"}
                </Button>

                <div className="text-center text-sm text-slate-400 pt-2">
                  <p className="text-xs">Default Service Account: service@gmail.com / 7654321</p>
                </div>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleEmployeeSignup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-300">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-300">
                    Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Street, Area, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-300">
                      State *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan" className="text-slate-300">
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      PAN Number *
                    </Label>
                    <Input
                      id="pan"
                      type="text"
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      required
                      maxLength={10}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhar" className="text-slate-300">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Aadhar Number *
                  </Label>
                  <Input
                    id="aadhar"
                    type="text"
                    placeholder="1234 5678 9012"
                    value={aadharNumber}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    required
                    maxLength={12}
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-300">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password *
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Register as Employee"}
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  * Employee ID will be generated automatically after registration
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <a
              href="/auth"
              className="text-xs text-slate-400 hover:text-orange-400 transition-colors"
            >
              Not a service employee? Go to user login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
