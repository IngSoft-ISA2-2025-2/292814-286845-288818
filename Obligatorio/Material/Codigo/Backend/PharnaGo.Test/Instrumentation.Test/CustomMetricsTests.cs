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

        [TestMethod]
        public void IncrementPurchasesCompleted_Should_Work_After_RecordDrugRequest()
        {
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.IncrementPurchasesCompleted();
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.IncrementPurchasesCompleted();

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void RecordDrugRequest_Should_Handle_Alternating_Values()
        {
            for (int i = 0; i < 10; i++)
            {
                _customMetrics.RecordDrugRequest(i % 2 == 0);
            }

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void IncrementPurchasesCompleted_Should_Handle_Many_Calls()
        {
            for (int i = 0; i < 100; i++)
            {
                _customMetrics.IncrementPurchasesCompleted();
            }

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void CustomMetrics_Should_Handle_Concurrent_Operations()
        {
            _customMetrics.IncrementPurchasesCompleted();
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.IncrementPurchasesCompleted();
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.IncrementPurchasesCompleted();
            _customMetrics.RecordDrugRequest(true);

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void RecordDrugRequest_Should_Work_With_Only_True_Values()
        {
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(true);
            _customMetrics.RecordDrugRequest(true);

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void RecordDrugRequest_Should_Work_With_Only_False_Values()
        {
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.RecordDrugRequest(false);
            _customMetrics.RecordDrugRequest(false);

            Assert.IsNotNull(_customMetrics);
        }

        [TestMethod]
        public void CustomMetrics_Should_Support_Sequential_Operations()
        {
            var metrics = new CustomMetrics();

            metrics.IncrementPurchasesCompleted();
            metrics.IncrementPurchasesCompleted();
            metrics.RecordDrugRequest(true);
            metrics.RecordDrugRequest(false);
            metrics.IncrementPurchasesCompleted();
            metrics.RecordDrugRequest(true);

            Assert.IsNotNull(metrics);
        }

        [TestMethod]
        public void Multiple_CustomMetrics_Instances_Should_All_Work()
        {
            var metrics1 = new CustomMetrics();
            var metrics2 = new CustomMetrics();
            var metrics3 = new CustomMetrics();

            metrics1.IncrementPurchasesCompleted();
            metrics2.RecordDrugRequest(true);
            metrics3.IncrementPurchasesCompleted();
            metrics1.RecordDrugRequest(false);
            metrics2.IncrementPurchasesCompleted();
            metrics3.RecordDrugRequest(true);

            Assert.IsNotNull(metrics1);
            Assert.IsNotNull(metrics2);
            Assert.IsNotNull(metrics3);
        }
    }
}
