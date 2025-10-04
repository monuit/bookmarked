import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign Out</h1>
          <p className="text-gray-600">Are you sure you want to sign out?</p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-base font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
        >
          Sign Out
        </button>
        
        <a
          href="/"
          className="block w-full text-center mt-4 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}

export default MainComponent;