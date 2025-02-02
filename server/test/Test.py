def print_and_sum_numbers(n, current_sum=0):
    if n < 1:
        return current_sum, []
    current_sum += n
    result = [n]
    sum_rest, rest = print_and_sum_numbers(n - 1, current_sum)
    return sum_rest, result + rest


def main():
    n = int(input("Enter a number: "))
    total_sum, numbers = print_and_sum_numbers(n)
    print(f"Numbers: {numbers}")
    print(f"Sum of numbers: {total_sum}")


if __name__ == "__main__":
    main()
