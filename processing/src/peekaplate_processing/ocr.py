from abc import ABC, abstractmethod


class OCRProvider(ABC):

    @abstractmethod
    def extract(self, image:bytes)->dict:
        """Return text, settings and cache_hit, or raise ExtractionError.

        Providers may also return image_sha256, regions, region_status and
        cache_warning. Image preparation belongs to the caller.
        """
        raise NotImplementedError
