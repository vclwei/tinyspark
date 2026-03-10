import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-12 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">加入 TinySpark ✨</h1>
          <p className="text-text-secondary text-sm mt-1">创建你的账号</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
