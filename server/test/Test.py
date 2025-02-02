import random
import math
import sys


def recursive_sum(n):
    """Recursively sum numbers from n down to 1."""
    if n <= 1:
        return n
    return n + recursive_sum(n-1)


def main():
    print("Recursive sum of 10:", recursive_sum(10))


if __name__ == "__main__":
    main()
