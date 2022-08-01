package org.test.math.utils;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class FibonacciParallelUtil implements FibonacciUtil {

    ExecutorService executorService = Executors.newFixedThreadPool(5);

    @Override
    public long calc(long number) {
        if (number <= 2) return 0;
        try {
            long result = executorService.submit(() -> calc(number - 1)).get() +
                    executorService.submit(() -> calc(number - 2)).get();
            return result;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
