import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-12 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">欢迎回来 👋</h1>
          <p className="text-text-secondary text-sm mt-1">登录你的 TinySpark 账号</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
