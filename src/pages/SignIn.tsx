const SignIn = ({ onSignIn }: { onSignIn: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="border-2 border-foreground p-8 w-full max-w-sm">
        <div className="border-2 border-foreground p-3 mb-8 text-center">
          <h1 className="text-lg font-bold text-foreground leading-tight">
            Financial Mis-Selling Detection System
          </h1>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-foreground p-3">
            <label className="text-sm text-muted-foreground">Username / Email</label>
          </div>

          <div className="border-2 border-foreground p-3">
            <label className="text-sm text-muted-foreground">Password</label>
          </div>

          <button
            onClick={onSignIn}
            className="w-full border-2 border-foreground bg-foreground text-primary-foreground p-3 text-center font-bold hover:bg-background hover:text-foreground transition-colors"
          >
            Sign In
          </button>

          <p className="text-center text-sm text-muted-foreground underline cursor-pointer">
            Forgot Password
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
