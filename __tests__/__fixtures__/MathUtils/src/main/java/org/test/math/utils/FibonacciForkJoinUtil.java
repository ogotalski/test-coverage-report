package org.test.math.utils;

import java.util.concurrent.*;

public class FibonacciForkJoinUtil implements FibonacciUtil {

    ForkJoinPool executorService = (ForkJoinPool) Executors.newWorkStealingPool();

    @Override
    public long calc(long number) {
        try {
            return executorService.invoke(new FibonacciTask(number));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private class FibonacciTask extends RecursiveTask<Long>
    {
        private Long number;

        public FibonacciTask(Long number) {
            this.number = number;
        }

        @Override
        protected Long compute() {
            if (number <= 2) return 1L;
            FibonacciTask fibonacciTask1 = new FibonacciTask(number - 1);
            fibonacciTask1.fork();
            FibonacciTask fibonacciTask2 = new FibonacciTask(number - 2);
            return fibonacciTask2.compute() + fibonacciTask1.join();
        }
    }
}
