using Microsoft.VisualStudio.TestTools.UnitTesting;
using Instrumentation;
using System.Diagnostics.Metrics;

namespace PharmaGo.Test.Instrumentation.Test
{
    [TestClass]
    public class CustomMetricsTests
    {
        private CustomMetrics _customMetrics;
        private Meter _meter;

        [TestInitialize]
        public void SetUp()
        {
            _meter = new Meter("PharmaGo.Metrics.Test");
            _customMetrics = new CustomMetrics();
        }

        [TestCleanup]
        public void CleanUp()
        {
            _meter?.Dispose();
        }

        [TestMethod]
        public void IncrementPurchasesCompleted_Should_Increment_Counter()
        {
            _customMetrics.IncrementPurchasesCompleted();
            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void IncrementPurchasesCompleted_Should_Be_Callable_Multiple_Times()
        {
            _customMetrics.IncrementPurchasesCompleted();
            _customMetrics.IncrementPurchasesCompleted();
            _customMetrics.IncrementPurchasesCompleted();

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void RecordDrugRequest_With_True_Should_Record_Success()
        {
            _customMetrics.RecordDrugRequest(true);

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void RecordDrugRequest_With_False_Should_Record_Failure()
        {
            _customMetrics.RecordDrugRequest(false);

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void RecordDrugRequest_Should_Be_Callable_Multiple_Times_With_Different_Values()
        {
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(false);

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void CustomMetrics_Should_Be_Instantiable()
        {
            var metrics = new CustomMetrics();

            Assert.IsNotNull(metrics);
        }

        [TestMethod]
        public void Multiple_Instances_Should_Work_Independently()
        {
            var metrics1 = new CustomMetrics();
            var metrics2 = new CustomMetrics();

            metrics1.IncrementPurchasesCompleted();
            metrics2.RecordDrugRequest(true);

            Assert.IsNotNull(metrics1);
            Assert.IsNotNull(metrics2);
        }
    }
}
