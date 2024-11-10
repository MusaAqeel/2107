import Hero from "@/components/hero";


export default async function Index() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Hero />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">
              Features Section
            </h2>
            {/* Add your features content here */}
          </div>
        </div>
      </main>
    </div>
  );
}
