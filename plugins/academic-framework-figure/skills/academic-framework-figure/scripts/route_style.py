#!/usr/bin/env python3
"""Select a figure profile from method-complexity signals."""

import argparse


def choose(branches: int, losses: int, train_test_split: bool, real_image_ratio: float, modalities: int) -> str:
    if branches >= 3 or losses >= 2 or train_test_split:
        return "structured-pipeline"
    if real_image_ratio >= 0.2 or modalities >= 2:
        return "visual-semantic"
    return "minimal-modular"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--branches", type=int, default=1)
    parser.add_argument("--losses", type=int, default=1)
    parser.add_argument("--train-test-split", action="store_true")
    parser.add_argument("--real-image-ratio", type=float, default=0)
    parser.add_argument("--modalities", type=int, default=1)
    args = parser.parse_args()
    print(choose(args.branches, args.losses, args.train_test_split, args.real_image_ratio, args.modalities))


if __name__ == "__main__":
    main()
