# 60-paper figure evidence corpus

`papers.json` contains coded observations for 60 accepted papers: 20 vision, 20 general machine learning, and 20 language/multimodal/computing papers. It covers 15 venue-year groups with four records per group.

The corpus stores links and original measurements only. It does not contain copied paper figures. Run `python3 research/build_corpus.py` to regenerate the deterministic JSON file and `python3 research/validate_corpus.py` to check counts, required fields, URL syntax, and inspection flags. The validator does not perform network reachability or independently prove acceptance; acceptance provenance is recorded in each entry's official proceedings URL and follows the documented review protocol.

The sampling and fallback protocol is documented inside the skill at `references/research-methodology.md`.
