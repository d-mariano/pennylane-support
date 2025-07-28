import pytest
from unittest.mock import patch
from censys_ai.services.summarization.summarizer import Summarizer, SummarizationConfig, SummarizationError
from censys_ai.models.host import HostsDataset, HostsDatasetMetadata, Host
from censys_ai.models.web_property import WebPropertiesDataset, WebPropertiesDatasetMetadata, WebProperty
from censys_ai.models.certificate import CertificatesDataset, CertificatesDatasetMetadata, Certificate

# Example minimal datasets for testing
def make_hosts_dataset():
    return HostsDataset(
        metadata=HostsDatasetMetadata(
            description="Test", 
            created_at="2025-01-01",
            data_sources=["censys_hosts"],
            hosts_count=1,
            ips_analyzed=["1.2.3.4"]
        ),
        hosts=[Host(ip="1.2.3.4")],
    )

def make_web_properties_dataset():
    return WebPropertiesDataset(
        metadata=WebPropertiesDatasetMetadata(
            description="Test",
            created_at="2025-01-01"
        ),
        web_properties=[WebProperty(hostname="example.com")]
    )

def make_certificates_dataset():
    return CertificatesDataset(
        metadata=CertificatesDatasetMetadata(
            description="Test",
            created_at="2025-01-01"
        ),
        certificates=[Certificate(fingerprint_sha256="abc123")]
    )

@pytest.fixture
def config():
    return SummarizationConfig(model="openai/gpt-4o")


@pytest.fixture
def mock_acompletion():
    with patch('censys_ai.services.summarization.summarizer.acompletion') as mock:
        yield mock

@pytest.mark.asyncio
async def test_summarize_hosts_success(mock_acompletion, config):
    mock_acompletion.return_value = {"choices": [{"message": {"content": "Test summary for hosts"}}]}
    summarizer = Summarizer(config)
    dataset = make_hosts_dataset()
    result = await summarizer.summarize_hosts(dataset)
    assert result == "Test summary for hosts"
    mock_acompletion.assert_awaited_once()

@pytest.mark.asyncio
async def test_summarize_web_properties_success(mock_acompletion, config):
    mock_acompletion.return_value = {"choices": [{"message": {"content": "Test summary for web properties"}}]}
    summarizer = Summarizer(config)
    dataset = make_web_properties_dataset()
    result = await summarizer.summarize_web_properties(dataset)
    assert result == "Test summary for web properties"
    mock_acompletion.assert_awaited_once()

@pytest.mark.asyncio
async def test_summarize_certificates_success(mock_acompletion, config):
    mock_acompletion.return_value = {"choices": [{"message": {"content": "Test summary for certificates"}}]}
    summarizer = Summarizer(config)
    dataset = make_certificates_dataset()
    result = await summarizer.summarize_certificates(dataset)
    assert result == "Test summary for certificates"
    mock_acompletion.assert_awaited_once()

@pytest.mark.asyncio
async def test_llm_failure_raises(mock_acompletion, config):
    mock_acompletion.side_effect = Exception("API error")
    summarizer = Summarizer(config)
    dataset = make_hosts_dataset()
    with pytest.raises(SummarizationError) as exc:
        await summarizer.summarize_hosts(dataset)
    assert "LLM summarization failed" in str(exc.value)
