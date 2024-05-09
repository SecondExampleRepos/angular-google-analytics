// ExampleService.ts
class ExampleService {
    private static instance: ExampleService;

    private constructor() {
        // Initialize any properties here
    }

    public static getInstance(): ExampleService {
        if (!ExampleService.instance) {
            ExampleService.instance = new ExampleService();
        }
        return ExampleService.instance;
    }

    public async fetchData(): Promise<any> {
        try {
            const response = await fetch('https://api.example.com/data');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error;
        }
    }
}

export default ExampleService;