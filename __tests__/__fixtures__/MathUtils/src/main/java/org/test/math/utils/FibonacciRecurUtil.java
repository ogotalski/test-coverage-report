package org.test.math.utils;

import java.util.HashMap;
import java.util.Map;

public class FibonacciRecurUtil implements FibonacciUtil {

    Map<Long, Long> cacheMap = new HashMap<>();

    @Override
    public long calc(long number) {
        if (number <= 2) return 1;
        if (!cacheMap.containsKey(number))
        {
            cacheMap.put(number, calc(number - 1) + calc(number - 2));
        }
        return  cacheMap.get(number);
    }
}
