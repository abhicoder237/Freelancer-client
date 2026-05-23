import { useState }        from "react";
import { useForm }         from "react-hook-form";
import { useAuth }         from "@context/AuthContext.jsx";
import { Button, Input }   from "@components/index.js";

// ─────────────────────────────────────────
// ADMIN LOGIN PAGE
// ─────────────────────────────────────────

const AdminLogin = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError,   setLoginError]   = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email:    "",
      password: "",
    },
  });

  // ── Submit ───────────────────────────────
  const onSubmit = async (data) => {
    setLoginError("");
    const result = await login(data);
    if (!result?.success) {
      setLoginError(result?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center
                    justify-center p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-background rounded-2xl shadow-modal
                        border border-border p-8">

          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary rounded-xl
                            flex items-center justify-center
                            mx-auto mb-4 text-white text-2xl font-bold">
              S
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Admin Panel
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Sign in to manage your platform
            </p>
          </div>

          {/* Error */}
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-lg px-4 py-3 text-sm mb-6 flex
                            items-center gap-2">
              <span>⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@youragency.com"
              error={errors.email?.message}
              required
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />

            {/* Password */}
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.password?.message}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-secondary hover:text-text-primary
                             transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              }
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value:   8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              size="lg"
              className="mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-text-secondary text-xs mt-6">
            © {new Date().getFullYear()} SaaS Agency Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;